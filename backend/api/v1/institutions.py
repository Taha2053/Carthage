"""
API v1 — Institutions CRUD
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from core.database import get_db
from schemas.institution import (
    InstitutionCreate,
    InstitutionResponse,
    InstitutionSummary,
    InstitutionUpdate,
)

router = APIRouter(prefix="/institutions", tags=["Institutions"])


@router.get("", response_model=list[InstitutionResponse])
async def list_institutions(
    is_active: Optional[bool] = Query(None),
    db=Depends(get_db),
):
    """List all institutions."""
    query = db.table("dim_institution").select("*")
    if is_active is not None:
        query = query.eq("is_active", is_active)
    query = query.order("name")
    
    response = query.execute()
    return response.data


@router.get("/{institution_id}", response_model=InstitutionResponse)
async def get_institution(institution_id: int, db=Depends(get_db)):
    """Get a single institution by ID."""
    response = db.table("dim_institution").select("*").eq("id", institution_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Institution not found")
    return response.data[0]


@router.get("/{institution_id}/summary", response_model=InstitutionSummary)
async def get_institution_summary(
    institution_id: int, db=Depends(get_db)
):
    """Get institution with aggregated KPI + alert counts."""
    # 1. Get institution
    inst_resp = db.table("dim_institution").select("*").eq("id", institution_id).execute()
    if not inst_resp.data:
        raise HTTPException(status_code=404, detail="Institution not found")
    inst = inst_resp.data[0]

    # 2. Count KPIs (exact count using count='exact')
    kpi_resp = db.table("fact_kpis").select("id", count="exact").eq("institution_id", institution_id).execute()
    kpi_count = kpi_resp.count if kpi_resp.count is not None else 0

    # 3. Count total unresolved alerts
    alert_resp = db.table("alerts").select("id", count="exact").eq("institution_id", institution_id).eq("is_resolved", False).execute()
    alert_count = alert_resp.count if alert_resp.count is not None else 0

    # 4. Count critical unresolved alerts
    crit_resp = db.table("alerts").select("id", count="exact").eq("institution_id", institution_id).eq("is_resolved", False).eq("severity", "critical").execute()
    critical_count = crit_resp.count if crit_resp.count is not None else 0

    # 5. Count departments
    dept_resp = db.table("dim_department").select("id", count="exact").eq("institution_id", institution_id).execute()
    dept_count = dept_resp.count if dept_resp.count is not None else 0

    # Add counts to inst dict
    inst["kpi_count"] = kpi_count
    inst["alert_count"] = alert_count
    inst["critical_alerts"] = critical_count
    inst["department_count"] = dept_count

    return inst


@router.post("", response_model=InstitutionResponse, status_code=201)
async def create_institution(
    data: InstitutionCreate, db=Depends(get_db)
):
    """Create a new institution."""
    response = db.table("dim_institution").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create institution")
    return response.data[0]


@router.patch("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: int,
    data: InstitutionUpdate,
    db=Depends(get_db),
):
    """Update an institution."""
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        # Nothing to update
        return await get_institution(institution_id, db)

    response = db.table("dim_institution").update(update_data).eq("id", institution_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Institution not found or update failed")
    return response.data[0]
