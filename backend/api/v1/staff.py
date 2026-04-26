"""
API v1 — Staff CRUD
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.staff import StaffCreate, StaffResponse, StaffUpdate

router = APIRouter(prefix="/staff", tags=["Staff"])


@router.get("", response_model=list[StaffResponse])
async def list_staff(
    institution_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    contract_type: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: AsyncClient = Depends(get_db),
):
    """List staff with filters."""
    query = db.table("dim_staff").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if department_id:
        query = query.eq("department_id", department_id)
    if category:
        query = query.eq("category", category)
    if is_active is not None:
        query = query.eq("is_active", is_active)
    if contract_type:
        query = query.eq("contract_type", contract_type)
    query = query.order("last_name").order("first_name").range(offset, offset + limit - 1)
    
    response = await query.execute()
    return response.data


@router.get("/{staff_id}", response_model=StaffResponse)
async def get_staff(staff_id: int, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_staff").select("*").eq("id", staff_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return response.data[0]


@router.post("", response_model=StaffResponse, status_code=201)
async def create_staff(data: StaffCreate, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_staff").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create staff member")
    return response.data[0]


@router.patch("/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: int, data: StaffUpdate, db: AsyncClient = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_staff(staff_id, db)
        
    response = await db.table("dim_staff").update(update_data).eq("id", staff_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return response.data[0]
