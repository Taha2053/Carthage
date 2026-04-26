"""
API v1 — KPIs (Dashboard Data)
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Path
from supabase._async.client import AsyncClient
from core.database import get_db
from core.events import event_bus
from services.kpi_engine import kpi_engine
from schemas.kpi import KPIOverrideRequest

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
    institution_id: Optional[int] = Query(None, description="Filter rankings for a specific institution"),
    metric_code: Optional[str] = Query(None, description="Filter rankings for a specific metric"),
    academic_year: Optional[str] = Query(None, description="Filter rankings for a specific academic year"),
    db: AsyncClient = Depends(get_db),
):
    """
    Network-wide leaderboard from mv_network_comparison.
    - Without filters: full network ranking across all metrics and institutions.
    - With institution_id: shows where that institution ranks for every metric.
    - With metric_code: shows all institutions ranked on a single metric.
    - Combine filters for granular slices.
    """
    if metric_code or academic_year:
        # Use the dedicated comparison method for metric-level slices
        return await kpi_engine.get_network_comparison(db, metric_code, academic_year)
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


@router.put("/{fact_id}/override")
async def override_kpi(
    fact_id: int = Path(..., description="ID of the fact_kpis record to override"),
    payload: KPIOverrideRequest = None,
    db: AsyncClient = Depends(get_db),
):
    """Manually override a KPI value and log it to the audit trail."""
    
    # 1. Check if the KPI exists
    existing = await db.table("fact_kpis").select("*").eq("id", fact_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="KPI record not found")
        
    old_data = existing.data[0]
    
    # 2. Update the KPI
    update_data = {
        "value": payload.new_value,
        "source": "manual"
    }
    await db.table("fact_kpis").update(update_data).eq("id", fact_id).execute()
    
    # 3. Write to Audit Log (Schema 6.3 in migrations)
    audit_entry = {
        "action": "UPDATE",
        "entity_type": "fact_kpis",
        "entity_id": str(fact_id),
        "old_value": old_data,
        "new_value": {**old_data, **update_data},
        "performed_by": str(payload.user_id),
        "description": f"Manual Override: {payload.reason}"
    }
    await db.table("audit_log").insert(audit_entry).execute()
    
    # 4. Trigger Redis Event so AI Agents/MVs know it changed
    await event_bus.publish(
        "kpi_updated",
        {
            "fact_id": fact_id,
            "metric_id": old_data.get("metric_id"),
            "institution_id": old_data.get("institution_id"),
            "old_value": old_data.get("value"),
            "new_value": payload.new_value
        }
    )
    
    return {"status": "success", "message": "KPI manually overridden and audited."}
