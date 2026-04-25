"""
UCAR Intelligence Hub — Alert Engine
Generates alerts on threshold breaches + AI priority scoring.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.alert import Alert
from models.fact_kpi import FactKPI
from models.institution import Institution
from models.metric import Metric

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

    async def generate_alerts(self, db: AsyncSession) -> int:
        """Run the DB generate_alerts() function and return count of new alerts."""
        try:
            await db.execute(text("SELECT generate_alerts()"))
            await db.commit()
            result = await db.execute(
                select(func.count(Alert.id)).where(Alert.is_resolved == False)
            )
            count = result.scalar() or 0
            logger.info(f"🚨 Generated alerts. Total unresolved: {count}")
            return count
        except Exception as e:
            logger.error(f"❌ Alert generation failed: {e}")
            return 0

    async def get_alerts(
        self,
        db: AsyncSession,
        institution_id: Optional[int] = None,
        severity: Optional[str] = None,
        resolved: Optional[bool] = False,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Fetch alerts with priority scoring."""
        query = (
            select(
                Alert,
                Institution.name.label("institution_name"),
                Institution.code.label("institution_code"),
                Metric.code.label("metric_code"),
                Metric.name.label("metric_name"),
            )
            .join(Institution, Alert.institution_id == Institution.id)
            .join(Metric, Alert.metric_id == Metric.id)
        )

        if institution_id:
            query = query.where(Alert.institution_id == institution_id)
        if severity:
            query = query.where(Alert.severity == severity)
        if resolved is not None:
            query = query.where(Alert.is_resolved == resolved)

        query = query.order_by(Alert.created_at.desc()).limit(limit)
        result = await db.execute(query)
        rows = result.all()

        alerts = []
        for row in rows:
            alert = row[0]
            score = compute_priority_score(
                alert.severity,
                float(alert.value or 0) - float(alert.threshold or 0),
                float(alert.value or 0),
                float(alert.threshold or 0),
            )
            alerts.append({
                "id": alert.id,
                "institution_id": alert.institution_id,
                "institution_name": row.institution_name,
                "institution_code": row.institution_code,
                "department_id": alert.department_id,
                "metric_id": alert.metric_id,
                "metric_code": row.metric_code,
                "metric_name": row.metric_name,
                "severity": alert.severity,
                "value": float(alert.value) if alert.value else None,
                "threshold": float(alert.threshold) if alert.threshold else None,
                "message": alert.message,
                "is_resolved": alert.is_resolved,
                "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
                "created_at": alert.created_at.isoformat() if alert.created_at else None,
                "priority": priority_label(score),
                "priority_score": score,
            })

        # Sort by priority score descending
        alerts.sort(key=lambda x: x["priority_score"], reverse=True)
        return alerts

    async def resolve_alert(self, db: AsyncSession, alert_id: int) -> bool:
        """Mark an alert as resolved."""
        result = await db.execute(
            update(Alert)
            .where(Alert.id == alert_id)
            .values(is_resolved=True, resolved_at=datetime.now(timezone.utc))
        )
        await db.commit()
        return result.rowcount > 0

    async def get_summary(self, db: AsyncSession) -> Dict[str, Any]:
        """Alert summary with counts by severity and institution."""
        total = await db.execute(select(func.count(Alert.id)))
        critical = await db.execute(
            select(func.count(Alert.id)).where(Alert.severity == "critical", Alert.is_resolved == False)
        )
        warning = await db.execute(
            select(func.count(Alert.id)).where(Alert.severity == "warning", Alert.is_resolved == False)
        )
        resolved = await db.execute(
            select(func.count(Alert.id)).where(Alert.is_resolved == True)
        )

        # By institution
        by_inst = await db.execute(
            select(
                Institution.name,
                Institution.code,
                func.count(Alert.id).label("count"),
            )
            .join(Institution, Alert.institution_id == Institution.id)
            .where(Alert.is_resolved == False)
            .group_by(Institution.name, Institution.code)
            .order_by(func.count(Alert.id).desc())
        )

        return {
            "total": total.scalar() or 0,
            "critical": critical.scalar() or 0,
            "warning": warning.scalar() or 0,
            "resolved": resolved.scalar() or 0,
            "unresolved": (total.scalar() or 0) - (resolved.scalar() or 0),
            "by_institution": [
                {"name": r.name, "code": r.code, "count": r.count}
                for r in by_inst.all()
            ],
        }


# Singleton
alert_engine = AlertEngine()
