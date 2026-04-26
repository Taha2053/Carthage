"""
API v1 — Spaces CRUD
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.space import SpaceCreate, SpaceResponse, SpaceUpdate

router = APIRouter(prefix="/spaces", tags=["Spaces"])


@router.get("", response_model=list[SpaceResponse])
async def list_spaces(
    institution_id: Optional[int] = Query(None),
    space_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    is_accessible: Optional[bool] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """List spaces with filters."""
    query = db.table("dim_space").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if space_type:
        query = query.eq("space_type", space_type)
    if is_active is not None:
        query = query.eq("is_active", is_active)
    if is_accessible is not None:
        query = query.eq("is_accessible", is_accessible)
    query = query.order("name")
    
    response = await query.execute()
    return response.data


@router.get("/{space_id}", response_model=SpaceResponse)
async def get_space(space_id: int, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_space").select("*").eq("id", space_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Space not found")
    return response.data[0]


@router.post("", response_model=SpaceResponse, status_code=201)
async def create_space(data: SpaceCreate, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_space").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create space")
    return response.data[0]


@router.patch("/{space_id}", response_model=SpaceResponse)
async def update_space(
    space_id: int, data: SpaceUpdate, db: AsyncClient = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_space(space_id, db)
        
    response = await db.table("dim_space").update(update_data).eq("id", space_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Space not found")
    return response.data[0]
