"""
API v1 — Equipment CRUD
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.equipment import EquipmentCreate, EquipmentResponse, EquipmentUpdate

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.get("", response_model=list[EquipmentResponse])
async def list_equipment(
    institution_id: Optional[int] = Query(None),
    space_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """List equipment with filters."""
    query = db.table("dim_equipment").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if space_id:
        query = query.eq("space_id", space_id)
    if category:
        query = query.eq("category", category)
    if status:
        query = query.eq("status", status)
    query = query.order("name")
    
    response = await query.execute()
    return response.data


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(equipment_id: int, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_equipment").select("*").eq("id", equipment_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return response.data[0]


@router.post("", response_model=EquipmentResponse, status_code=201)
async def create_equipment(data: EquipmentCreate, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_equipment").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create equipment")
    return response.data[0]


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int, data: EquipmentUpdate, db: AsyncClient = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_equipment(equipment_id, db)
        
    response = await db.table("dim_equipment").update(update_data).eq("id", equipment_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return response.data[0]
