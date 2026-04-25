"""
API v1 — KPIs (Dashboard Data)
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from services.kpi_engine import kpi_engine

router = APIRouter(prefix="/kpis", tags=["KPIs"])


@router.get("")
async def get_latest_kpis(
    institution_id: Optional[int] = Query(None),
    domain_code: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """All latest KPIs (from mv_latest_kpis)."""
    return await kpi_engine.get_latest_kpis(db, institution_id, domain_code)


@router.get("/institution/{institution_id}")
async def get_institution_kpis(
    institution_id: int, db: AsyncSession = Depends(get_db)
):
    """KPIs for one institution."""
    return await kpi_engine.get_latest_kpis(db, institution_id=institution_id)


@router.get("/department/{department_id}")
async def get_department_kpis(
    department_id: int,
    institution_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """KPIs for one department."""
    return await kpi_engine.get_department_kpis(db, institution_id, department_id)


@router.get("/domain/{domain_code}")
async def get_domain_kpis(
    domain_code: str, db: AsyncSession = Depends(get_db)
):
    """KPIs filtered by domain (ACADEMIC, FINANCE, etc.)."""
    return await kpi_engine.get_latest_kpis(db, domain_code=domain_code)


@router.get("/compare")
async def compare_institutions(
    metric_code: str = Query(..., description="Metric code to compare"),
    db: AsyncSession = Depends(get_db),
):
    """Cross-institution comparison for a single metric."""
    return await kpi_engine.get_comparison(db, metric_code)


@router.get("/trends")
async def get_trends(
    metric_code: str = Query(...),
    institution_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """KPI trends over time."""
    return await kpi_engine.get_trends(db, metric_code, institution_id)


@router.get("/domain-averages")
async def get_domain_averages(
    academic_year: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Domain-level averages (from mv_domain_averages)."""
    return await kpi_engine.get_domain_averages(db, academic_year)


@router.get("/rankings")
async def get_rankings(
    institution_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Department rankings within institution (from mv_dept_comparison)."""
    return await kpi_engine.get_dept_rankings(db, institution_id)


@router.post("/refresh")
async def refresh_views(db: AsyncSession = Depends(get_db)):
    """Manually refresh materialized views."""
    await kpi_engine.refresh_materialized_views(db)
    return {"status": "refreshed"}
