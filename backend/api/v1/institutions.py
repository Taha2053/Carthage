"""
API v1 — Institutions CRUD
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.institution import Institution
from models.department import Department
from models.alert import Alert
from models.fact_kpi import FactKPI
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
    db: AsyncSession = Depends(get_db),
):
    """List all institutions."""
    query = select(Institution)
    if is_active is not None:
        query = query.where(Institution.is_active == is_active)
    query = query.order_by(Institution.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{institution_id}", response_model=InstitutionResponse)
async def get_institution(institution_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single institution by ID."""
    result = await db.execute(
        select(Institution).where(Institution.id == institution_id)
    )
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    return inst


@router.get("/{institution_id}/summary", response_model=InstitutionSummary)
async def get_institution_summary(
    institution_id: int, db: AsyncSession = Depends(get_db)
):
    """Get institution with aggregated KPI + alert counts."""
    result = await db.execute(
        select(Institution).where(Institution.id == institution_id)
    )
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    # Count KPIs
    kpi_count = await db.execute(
        select(func.count(FactKPI.id)).where(FactKPI.institution_id == institution_id)
    )
    # Count alerts
    alert_count = await db.execute(
        select(func.count(Alert.id)).where(
            Alert.institution_id == institution_id, Alert.is_resolved == False
        )
    )
    critical_count = await db.execute(
        select(func.count(Alert.id)).where(
            Alert.institution_id == institution_id,
            Alert.severity == "critical",
            Alert.is_resolved == False,
        )
    )
    dept_count = await db.execute(
        select(func.count(Department.id)).where(
            Department.institution_id == institution_id
        )
    )

    return InstitutionSummary(
        id=inst.id,
        uuid=inst.uuid,
        code=inst.code,
        name=inst.name,
        short_name=inst.short_name,
        city=inst.city,
        region=inst.region,
        institution_type=inst.institution_type,
        founding_year=inst.founding_year,
        student_capacity=inst.student_capacity,
        is_active=inst.is_active,
        created_at=inst.created_at,
        kpi_count=kpi_count.scalar() or 0,
        alert_count=alert_count.scalar() or 0,
        critical_alerts=critical_count.scalar() or 0,
        department_count=dept_count.scalar() or 0,
    )


@router.post("", response_model=InstitutionResponse, status_code=201)
async def create_institution(
    data: InstitutionCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new institution."""
    inst = Institution(**data.model_dump())
    db.add(inst)
    await db.flush()
    await db.refresh(inst)
    return inst


@router.patch("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: int,
    data: InstitutionUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an institution."""
    result = await db.execute(
        select(Institution).where(Institution.id == institution_id)
    )
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(inst, field, value)

    await db.flush()
    await db.refresh(inst)
    return inst
