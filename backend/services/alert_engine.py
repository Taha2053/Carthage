"""
UCAR Intelligence Hub — Alert Engine
Generates alerts on threshold breaches + AI priority scoring.
Refactored to use Supabase SDK instead of SQLAlchemy.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def compute_priority_score(severity: str, delta_pct: Optional[float], value: float, threshold: float) -> float:
    """
    AI Priority Scoring (rule-based):
    Score = severity_weight × delta_magnitude × threshold_distance
    Result: HIGH (>0.7), MEDIUM (0.4-0.7), LOW (<0.4)
    """
    severity_weight = 1.0 if severity == "critical" else 0.6
    delta_magnitude = min(abs(delta_pct or 0) / 100.0, 1.0)
    if threshold and threshold != 0:
        threshold_distance = min(abs(value - threshold) / abs(threshold), 1.0)
    else:
        threshold_distance = 0.5
    score = severity_weight * 0.5 + delta_magnitude * 0.3 + threshold_distance * 0.2
    return round(min(score, 1.0), 3)


def priority_label(score: float) -> str:
    if score > 0.7:
        return "HIGH"
    elif score > 0.4:
        return "MEDIUM"
    return "LOW"


class AlertEngine:
    """Generates and manages alerts with AI prioritization."""

    async def generate_alerts(self, db: AsyncClient) -> int:
        """Run the DB generate_alerts() function and return count of new alerts."""
        try:
            # Requires an RPC in Supabase
            await db.rpc("generate_alerts").execute()
            
            resp = await db.table("alerts").select("id", count="exact").eq("is_resolved", False).execute()
            count = resp.count if resp.count is not None else 0
            logger.info(f"🚨 Generated alerts. Total unresolved: {count}")
            return count
        except Exception as e:
            logger.error(f"❌ Alert generation failed: {e}")
            return 0

    async def get_alerts(
        self,
        db: AsyncClient,
        institution_id: Optional[int] = None,
        severity: Optional[str] = None,
        resolved: Optional[bool] = False,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Fetch alerts with priority scoring."""
        query = db.table("alerts").select(
            "*, dim_institution(name, code), dim_metric(code, name)"
        )

        if institution_id:
            query = query.eq("institution_id", institution_id)
        if severity:
            query = query.eq("severity", severity)
        if resolved is not None:
            query = query.eq("is_resolved", resolved)

        query = query.order("created_at", desc=True).limit(limit)
        response = query.execute()

        alerts = []
        for row in response.data:
            inst = row.get("dim_institution", {}) or {}
            metric = row.get("dim_metric", {}) or {}
            
            # Use DB priority_score if available, otherwise compute
            db_score = float(row.get("priority_score")) if row.get("priority_score") is not None else None
            val = float(row.get("value")) if row.get("value") is not None else 0.0
            thr = float(row.get("threshold")) if row.get("threshold") is not None else 0.0
            dp = float(row.get("delta_pct")) if row.get("delta_pct") is not None else 0.0
            
            if db_score is None:
                score = compute_priority_score(row.get("severity"), dp, val, thr)
            else:
                score = db_score / 100.0

            alerts.append({
                "id": row.get("id"),
                "institution_id": row.get("institution_id"),
                "institution_name": inst.get("name"),
                "institution_code": inst.get("code"),
                "department_id": row.get("department_id"),
                "metric_id": row.get("metric_id"),
                "metric_code": metric.get("code"),
                "metric_name": metric.get("name"),
                "severity": row.get("severity"),
                "alert_type": row.get("alert_type"),
                "value": val,
                "threshold": thr,
                "delta_pct": dp,
                "message": row.get("message"),
                "explanation": row.get("explanation"),
                "recommended_action": row.get("recommended_action"),
                "is_resolved": row.get("is_resolved"),
                "resolved_by": row.get("resolved_by"),
                "resolved_at": row.get("resolved_at"),
                "resolution_note": row.get("resolution_note"),
                "created_at": row.get("created_at"),
                "priority": priority_label(score),
                "priority_score": score,
            })

        alerts.sort(key=lambda x: x["priority_score"], reverse=True)
        return alerts

    async def resolve_alert(
        self, db: AsyncClient, alert_id: int,
        resolved_by: str | None = None,
        resolution_note: str | None = None,
    ) -> bool:
        """Mark an alert as resolved with optional attribution."""
        values = {
            "is_resolved": True,
            "resolved_at": datetime.now(timezone.utc).isoformat(),
        }
        if resolved_by:
            values["resolved_by"] = resolved_by
        if resolution_note:
            values["resolution_note"] = resolution_note
            
        resp = await db.table("alerts").update(values).eq("id", alert_id).execute()
        return len(resp.data) > 0

    async def get_summary(self, db: AsyncClient) -> Dict[str, Any]:
        """Alert summary with counts by severity and institution."""
        total_resp = await db.table("alerts").select("id", count="exact").execute()
        total = total_resp.count if total_resp.count is not None else 0
        
        crit_resp = await db.table("alerts").select("id", count="exact").eq("severity", "critical").eq("is_resolved", False).execute()
        critical = crit_resp.count if crit_resp.count is not None else 0
        
        warn_resp = await db.table("alerts").select("id", count="exact").eq("severity", "warning").eq("is_resolved", False).execute()
        warning = warn_resp.count if warn_resp.count is not None else 0
        
        res_resp = await db.table("alerts").select("id", count="exact").eq("is_resolved", True).execute()
        resolved = res_resp.count if res_resp.count is not None else 0
        
        # Grouping by institution is not natively supported via Supabase Python SDK easily
        # Fetch all unresolved to do in memory
        unres_resp = await db.table("alerts").select("institution_id, dim_institution(name, code)").eq("is_resolved", False).execute()
        
        inst_counts = {}
        for r in unres_resp.data:
            inst = r.get("dim_institution")
            if not inst:
                continue
            code = inst.get("code")
            name = inst.get("name")
            key = (code, name)
            if key not in inst_counts:
                inst_counts[key] = 0
            inst_counts[key] += 1
            
        by_inst = [{"code": k[0], "name": k[1], "count": v} for k, v in inst_counts.items()]
        by_inst.sort(key=lambda x: x["count"], reverse=True)

        return {
            "total": total,
            "critical": critical,
            "warning": warning,
            "resolved": resolved,
            "unresolved": total - resolved,
            "by_institution": by_inst,
        }


# Singleton
alert_engine = AlertEngine()
