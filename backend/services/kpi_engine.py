"""
UCAR Intelligence Hub — KPI Engine
Computes, caches, and serves KPI data from the star schema.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from core.events import event_bus
from models.fact_kpi import FactKPI
from models.institution import Institution
from models.metric import Metric
from models.time_dim import TimeDimension

logger = logging.getLogger(__name__)


class KPIEngine:
    """
    Compute-once, reuse-everywhere KPI engine.
    Queries materialized views, caches in Redis, triggers recomputation on changes.
    """

    CACHE_TTL = 300  # 5 minutes

    async def get_latest_kpis(
        self,
        db: AsyncSession,
        institution_id: Optional[int] = None,
        domain_code: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch latest KPIs from mv_latest_kpis materialized view."""
        cache_key = f"kpis:latest:{institution_id or 'all'}:{domain_code or 'all'}"
        cached = await event_bus.cache_get(cache_key)
        if cached:
            return cached

        query = "SELECT * FROM mv_latest_kpis WHERE 1=1"
        params: Dict[str, Any] = {}

        if institution_id:
            query += " AND institution_id = :inst_id"
            params["inst_id"] = institution_id
        if domain_code:
            query += " AND domain_code = :domain_code"
            params["domain_code"] = domain_code

        query += " ORDER BY domain_code, metric_code"

        result = await db.execute(text(query), params)
        rows = result.mappings().all()
        kpis = [dict(r) for r in rows]

        for kpi in kpis:
            for k, v in kpi.items():
                if hasattr(v, "is_finite"):
                    kpi[k] = float(v)

        await event_bus.cache_set(cache_key, kpis, self.CACHE_TTL)
        return kpis

    async def get_department_kpis(
        self,
        db: AsyncSession,
        institution_id: Optional[int] = None,
        department_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch department-level KPIs from mv_latest_kpis_by_dept."""
        cache_key = f"kpis:dept:{institution_id or 'all'}:{department_id or 'all'}"
        cached = await event_bus.cache_get(cache_key)
        if cached:
            return cached

        query = "SELECT * FROM mv_latest_kpis_by_dept WHERE 1=1"
        params: Dict[str, Any] = {}

        if institution_id:
            query += " AND institution_id = :inst_id"
            params["inst_id"] = institution_id
        if department_id:
            query += " AND department_id = :dept_id"
            params["dept_id"] = department_id

        result = await db.execute(text(query), params)
        rows = result.mappings().all()
        kpis = [dict(r) for r in rows]

        for kpi in kpis:
            for k, v in kpi.items():
                if hasattr(v, "is_finite"):
                    kpi[k] = float(v)

        await event_bus.cache_set(cache_key, kpis, self.CACHE_TTL)
        return kpis

    async def get_domain_averages(
        self, db: AsyncSession, academic_year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch cross-institution domain averages from mv_domain_averages."""
        cache_key = f"kpis:domain_avg:{academic_year or 'all'}"
        cached = await event_bus.cache_get(cache_key)
        if cached:
            return cached

        query = "SELECT * FROM mv_domain_averages WHERE 1=1"
        params: Dict[str, Any] = {}

        if academic_year:
            query += " AND academic_year = :ay"
            params["ay"] = academic_year

        query += " ORDER BY domain_code, academic_year, semester"

        result = await db.execute(text(query), params)
        rows = result.mappings().all()
        data = [dict(r) for r in rows]

        for item in data:
            for k, v in item.items():
                if hasattr(v, "is_finite"):
                    item[k] = float(v)

        await event_bus.cache_set(cache_key, data, self.CACHE_TTL)
        return data

    async def get_dept_rankings(
        self, db: AsyncSession, institution_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Fetch department rankings from mv_dept_comparison."""
        query = "SELECT * FROM mv_dept_comparison WHERE 1=1"
        params: Dict[str, Any] = {}

        if institution_id:
            inst_result = await db.execute(
                select(Institution.name).where(Institution.id == institution_id)
            )
            inst_name = inst_result.scalar_one_or_none()
            if inst_name:
                query += " AND institution_name = :inst_name"
                params["inst_name"] = inst_name

        query += " ORDER BY metric_code, rank_within_institution"

        result = await db.execute(text(query), params)
        rows = result.mappings().all()
        data = [dict(r) for r in rows]

        for item in data:
            for k, v in item.items():
                if hasattr(v, "is_finite"):
                    item[k] = float(v)

        return data

    async def get_trends(
        self,
        db: AsyncSession,
        metric_code: str,
        institution_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Get KPI values over time for trend analysis."""
        query = (
            select(
                FactKPI.institution_id,
                Institution.name.label("institution_name"),
                Institution.code.label("institution_code"),
                Metric.code.label("metric_code"),
                Metric.name.label("metric_name"),
                TimeDimension.academic_year,
                TimeDimension.semester,
                FactKPI.value,
            )
            .join(Institution, FactKPI.institution_id == Institution.id)
            .join(Metric, FactKPI.metric_id == Metric.id)
            .join(TimeDimension, FactKPI.time_id == TimeDimension.id)
            .where(Metric.code == metric_code, FactKPI.department_id.is_(None))
            .order_by(TimeDimension.academic_year, TimeDimension.semester)
        )

        if institution_id:
            query = query.where(FactKPI.institution_id == institution_id)

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                "institution_id": r.institution_id,
                "institution_name": r.institution_name,
                "institution_code": r.institution_code,
                "metric_code": r.metric_code,
                "metric_name": r.metric_name,
                "academic_year": r.academic_year,
                "semester": r.semester,
                "value": float(r.value) if r.value else None,
            }
            for r in rows
        ]

    async def get_comparison(
        self, db: AsyncSession, metric_code: str
    ) -> Dict[str, Any]:
        """Cross-institution comparison for a single metric."""
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

    async def refresh_materialized_views(self, db: AsyncSession) -> None:
        """Refresh all materialized views after data changes."""
        views = [
            "mv_latest_kpis",
            "mv_latest_kpis_by_dept",
            "mv_domain_averages",
            "mv_dept_comparison",
        ]
        for view in views:
            try:
                await db.execute(text(f"REFRESH MATERIALIZED VIEW {view}"))
                logger.info(f"Refreshed {view}")
            except Exception as e:
                logger.error(f"Failed to refresh {view}: {e}")

        await db.commit()

        # Invalidate caches
        await event_bus.cache_delete("kpis:*")
        logger.info("KPI cache invalidated")


# Singleton
kpi_engine = KPIEngine()
