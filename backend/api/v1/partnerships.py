"""
API v1 — Partnerships CRUD
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from schemas.partnership import PartnershipCreate, PartnershipResponse, PartnershipUpdate

router = APIRouter(prefix="/partnerships", tags=["Partnerships"])


@router.get("", response_model=list[PartnershipResponse])
async def list_partnerships(
    institution_id: Optional[int] = Query(None),
    scope: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db=Depends(get_db),
):
    """List partnerships with filters."""
    query = db.table("dim_partnership").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if scope:
        query = query.eq("scope", scope)
    if status:
        query = query.eq("status", status)
    query = query.order("partner_name")
    
    response = query.execute()
    return response.data


@router.get("/{partnership_id}", response_model=PartnershipResponse)
async def get_partnership(partnership_id: int, db=Depends(get_db)):
    response = db.table("dim_partnership").select("*").eq("id", partnership_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Partnership not found")
    return response.data[0]


@router.post("", response_model=PartnershipResponse, status_code=201)
async def create_partnership(data: PartnershipCreate, db=Depends(get_db)):
    response = db.table("dim_partnership").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create partnership")
    return response.data[0]


@router.patch("/{partnership_id}", response_model=PartnershipResponse)
async def update_partnership(
    partnership_id: int, data: PartnershipUpdate, db=Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_partnership(partnership_id, db)
        
    response = db.table("dim_partnership").update(update_data).eq("id", partnership_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Partnership not found")
    return response.data[0]
