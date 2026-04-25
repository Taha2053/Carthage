"""
API v1 — KPIs (Dashboard Data)
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from services.kpi_engine import kpi_engine

router = APIRouter(prefix="/kpis", tags=["KPIs"])


@router.get("")
async def get_latest_kpis(
    institution_id: Optional[int] = Query(None),
    domain_code: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """All latest KPIs (from fact_kpis)."""
    return await kpi_engine.get_latest_kpis(db, institution_id, domain_code)


@router.get("/institution/{institution_id}")
async def get_institution_kpis(
    institution_id: int, db: AsyncClient = Depends(get_db)
):
    """KPIs for one institution."""
    return await kpi_engine.get_latest_kpis(db, institution_id=institution_id)


@router.get("/department/{department_id}")
async def get_department_kpis(
    department_id: int,
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """KPIs for one department."""
    return await kpi_engine.get_department_kpis(db, institution_id, department_id)


@router.get("/domain/{domain_code}")
async def get_domain_kpis(
    domain_code: str, db: AsyncClient = Depends(get_db)
):
    """KPIs filtered by domain (academic, finance, etc.)."""
    return await kpi_engine.get_latest_kpis(db, domain_code=domain_code)


@router.get("/compare")
async def compare_institutions(
    metric_code: str = Query(..., description="Metric code to compare"),
    db: AsyncClient = Depends(get_db),
):
    """Cross-institution comparison for a single metric."""
    return await kpi_engine.get_comparison(db, metric_code)


@router.get("/trends")
async def get_trends(
    metric_code: str = Query(...),
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """KPI trends over time."""
    return await kpi_engine.get_trends(db, metric_code, institution_id)


@router.get("/domain-averages")
async def get_domain_averages(
    academic_year: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Domain-level averages."""
    return await kpi_engine.get_domain_averages(db, academic_year)


@router.get("/rankings")
async def get_rankings(
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Network-wide rankings (from mv_network_comparison)."""
    return await kpi_engine.get_dept_rankings(db, institution_id)


# ── New MV-specific endpoints ────────────────────────────────

@router.get("/success-rate")
async def success_rate(
    institution_id: Optional[int] = Query(None),
    academic_year: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Success rates from mv_success_rate."""
    return await kpi_engine.get_success_rates(db, institution_id, academic_year)


@router.get("/dropout-rate")
async def dropout_rate(
    institution_id: Optional[int] = Query(None),
    academic_year: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Dropout/repetition/graduation rates from mv_dropout_rate."""
    return await kpi_engine.get_dropout_rates(db, institution_id, academic_year)


@router.get("/attendance-rate")
async def attendance_rate(
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Attendance rates from mv_attendance_rate."""
    return await kpi_engine.get_attendance_rates(db, institution_id)


@router.get("/budget-execution")
async def budget_execution(
    institution_id: Optional[int] = Query(None),
    fiscal_year: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Budget execution from mv_budget_execution."""
    return await kpi_engine.get_budget_execution(db, institution_id, fiscal_year)


@router.get("/employability")
async def employability(
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Employability rates from mv_employability."""
    return await kpi_engine.get_employability(db, institution_id)


@router.get("/hr-summary")
async def hr_summary(
    institution_id: Optional[int] = Query(None),
    academic_year: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """HR summary from mv_hr_summary."""
    return await kpi_engine.get_hr_summary(db, institution_id, academic_year)


@router.get("/network-comparison")
async def network_comparison(
    metric_code: Optional[str] = Query(None),
    academic_year: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Network comparison from mv_network_comparison."""
    return await kpi_engine.get_network_comparison(db, metric_code, academic_year)


@router.post("/refresh")
async def refresh_views(db: AsyncClient = Depends(get_db)):
    """Manually refresh all 8 materialized views."""
    await kpi_engine.refresh_materialized_views(db)
    return {"status": "refreshed", "views": 8}
