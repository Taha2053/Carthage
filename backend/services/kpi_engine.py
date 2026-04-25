"""
UCAR Intelligence Hub — KPI Engine
Computes, caches, and serves KPI data from the star schema.
Refactored to use Supabase SDK (REST API) instead of SQLAlchemy.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from supabase._async.client import AsyncClient
from core.events import event_bus

logger = logging.getLogger(__name__)


class KPIEngine:
    """
    Compute-once, reuse-everywhere KPI engine.
    Queries materialized views via Supabase REST API, caches in Redis.
    """

    CACHE_TTL = 300  # 5 minutes

    # ── MV Queries ───────────────────────────────────────────

    async def get_success_rates(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
        academic_year: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("mv_success_rate").select("*")
        if institution_id:
            query = query.eq("institution_id", institution_id)
        if academic_year:
            query = query.eq("academic_year", academic_year)
        query = query.order("academic_year", desc=True).order("semester")
        response = await query.execute()
        return response.data

    async def get_dropout_rates(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
        academic_year: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("mv_dropout_rate").select("*")
        if institution_id:
            query = query.eq("institution_id", institution_id)
        if academic_year:
            query = query.eq("academic_year", academic_year)
        query = query.order("academic_year", desc=True)
        response = await query.execute()
        return response.data

    async def get_attendance_rates(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("mv_attendance_rate").select("*")
        if institution_id:
            query = query.eq("institution_id", institution_id)
        response = await query.execute()
        return response.data

    async def get_budget_execution(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
        fiscal_year: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("mv_budget_execution").select("*")
        if institution_id:
            query = query.eq("institution_id", institution_id)
        if fiscal_year:
            query = query.eq("fiscal_year", fiscal_year)
        query = query.order("fiscal_year", desc=True).order("budget_type")
        response = await query.execute()
        return response.data

    async def get_employability(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("mv_employability").select("*")
        if institution_id:
            query = query.eq("institution_id", institution_id)
        query = query.order("graduation_year", desc=True)
        response = await query.execute()
        return response.data

    async def get_hr_summary(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
        academic_year: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("mv_hr_summary").select("*")
        if institution_id:
            query = query.eq("institution_id", institution_id)
        if academic_year:
            query = query.eq("academic_year", academic_year)
        query = query.order("academic_year", desc=True)
        response = await query.execute()
        return response.data

    async def get_network_comparison(
        self, db: AsyncClient,
        metric_code: Optional[str] = None,
        academic_year: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("mv_network_comparison").select("*")
        if metric_code:
            query = query.eq("metric_code", metric_code)
        if academic_year:
            query = query.eq("academic_year", academic_year)
        query = query.order("metric_code").order("network_rank")
        response = await query.execute()
        return response.data

    # ── Legacy-compatible methods ────────────────────────────

    async def get_latest_kpis(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
        domain_code: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch latest KPIs from fact_kpis with joins."""
        # Supabase nested select:
        query = db.table("fact_kpis").select(
            "*, dim_institution(name, code), dim_metric(code, name, unit, higher_is_better, dim_domain(code, name, color_hex)), dim_time(academic_year, semester)"
        ).is_("department_id", "null")
        
        if institution_id:
            query = query.eq("institution_id", institution_id)
            
        response = await query.execute()
        
        # Flatten the data to match legacy schema
        flattened = []
        for r in response.data:
            metric = r.get("dim_metric", {}) or {}
            domain = metric.get("dim_domain", {}) or {}
            time = r.get("dim_time", {}) or {}
            inst = r.get("dim_institution", {}) or {}
            
            # If domain_code filter is active, skip manually if PostgREST didn't filter
            if domain_code and domain.get("code") != domain_code:
                continue
                
            flattened.append({
                "id": r.get("id"),
                "institution_id": r.get("institution_id"),
                "institution_name": inst.get("name"),
                "institution_code": inst.get("code"),
                "metric_id": r.get("metric_id"),
                "metric_code": metric.get("code"),
                "metric_name": metric.get("name"),
                "unit": metric.get("unit"),
                "domain_code": domain.get("code"),
                "domain_name": domain.get("name"),
                "color_hex": domain.get("color_hex"),
                "academic_year": time.get("academic_year"),
                "semester": time.get("semester"),
                "value": r.get("value"),
                "value_previous": r.get("value_previous"),
                "delta_pct": r.get("delta_pct"),
                "higher_is_better": metric.get("higher_is_better"),
            })
            
        return flattened

    async def get_department_kpis(
        self, db: AsyncClient,
        institution_id: Optional[int] = None,
        department_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("fact_kpis").select(
            "*, dim_metric(code, name), dim_department(code, name)"
        ).not_.is_("department_id", "null")
        
        if institution_id:
            query = query.eq("institution_id", institution_id)
        if department_id:
            query = query.eq("department_id", department_id)
            
        response = await query.execute()
        
        flattened = []
        for r in response.data:
            metric = r.get("dim_metric", {}) or {}
            dept = r.get("dim_department", {}) or {}
            flat = r.copy()
            flat.pop("dim_metric", None)
            flat.pop("dim_department", None)
            flat["metric_code"] = metric.get("code")
            flat["metric_name"] = metric.get("name")
            flat["department_code"] = dept.get("code")
            flat["department_name"] = dept.get("name")
            flattened.append(flat)
            
        return flattened

    async def get_domain_averages(
        self, db: AsyncClient, academic_year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """We will fallback to an RPC call if available, or compute in memory for now."""
        # For a full REST API, we'd need an RPC or a View for this aggregation.
        # Computing in memory from get_latest_kpis
        data = await self.get_latest_kpis(db)
        if academic_year:
            data = [d for d in data if d.get("academic_year") == academic_year]
            
        domains = {}
        for d in data:
            key = (d.get("domain_code"), d.get("academic_year"), d.get("semester"))
            if key not in domains:
                domains[key] = {
                    "domain_code": d.get("domain_code"),
                    "domain_name": d.get("domain_name"),
                    "color_hex": d.get("color_hex"),
                    "academic_year": d.get("academic_year"),
                    "semester": d.get("semester"),
                    "institutions": set(),
                    "values": []
                }
            if d.get("value") is not None:
                domains[key]["values"].append(d.get("value"))
                domains[key]["institutions"].add(d.get("institution_id"))
                
        result = []
        for v in domains.values():
            vals = v["values"]
            if vals:
                v["avg_value"] = round(sum(vals)/len(vals), 2)
                v["min_value"] = min(vals)
                v["max_value"] = max(vals)
            else:
                v["avg_value"] = v["min_value"] = v["max_value"] = 0
            v["institution_count"] = len(v["institutions"])
            del v["institutions"]
            del v["values"]
            result.append(v)
            
        return sorted(result, key=lambda x: (x["domain_code"] or "", x["academic_year"] or "", x["semester"] or ""))

    async def get_dept_rankings(
        self, db: AsyncClient, institution_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        return await self.get_network_comparison(db)

    async def get_trends(
        self, db: AsyncClient,
        metric_code: str,
        institution_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        query = db.table("fact_kpis").select(
            "value, institution_id, dim_institution(name, code), dim_metric(code, name), dim_time(academic_year, semester)"
        ).is_("department_id", "null")
        
        if institution_id:
            query = query.eq("institution_id", institution_id)
            
        response = await query.execute()
        
        flattened = []
        for r in response.data:
            metric = r.get("dim_metric", {}) or {}
            if metric.get("code") != metric_code:
                continue
            inst = r.get("dim_institution", {}) or {}
            time = r.get("dim_time", {}) or {}
            
            flattened.append({
                "institution_id": r.get("institution_id"),
                "institution_name": inst.get("name"),
                "institution_code": inst.get("code"),
                "metric_code": metric.get("code"),
                "metric_name": metric.get("name"),
                "academic_year": time.get("academic_year"),
                "semester": time.get("semester"),
                "value": r.get("value"),
            })
            
        return sorted(flattened, key=lambda x: (x["academic_year"] or "", x["semester"] or ""))

    async def get_comparison(
        self, db: AsyncClient, metric_code: str
    ) -> Dict[str, Any]:
        kpis = await self.get_latest_kpis(db)
        filtered = [k for k in kpis if k.get("metric_code") == metric_code]
        values = [k["value"] for k in filtered if k.get("value") is not None]
        return {
            "metric_code": metric_code,
            "institutions": filtered,
            "average": round(sum(values) / max(len(values), 1), 2) if values else 0,
            "min_value": min(values) if values else 0,
            "max_value": max(values) if values else 0,
        }

    async def refresh_materialized_views(self, db: AsyncClient) -> None:
        """REST API cannot natively refresh views unless via RPC."""
        try:
            # We assume a Supabase RPC function 'refresh_all_mvs' might be created later
            # await db.rpc("refresh_all_mvs").execute()
            logger.info("Materialized view refresh requested (requires RPC on Supabase)")
        except Exception as e:
            logger.error(f"Failed to call RPC: {e}")

# Singleton
kpi_engine = KPIEngine()
