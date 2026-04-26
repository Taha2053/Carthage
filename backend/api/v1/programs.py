"""
API v1 — Programs CRUD
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from schemas.program import ProgramCreate, ProgramResponse, ProgramUpdate

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.get("", response_model=list[ProgramResponse])
async def list_programs(
    institution_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    degree_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db=Depends(get_db),
):
    """List academic programs with filters."""
    query = db.table("dim_program").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if department_id:
        query = query.eq("department_id", department_id)
    if degree_type:
        query = query.eq("degree_type", degree_type)
    if is_active is not None:
        query = query.eq("is_active", is_active)
    query = query.order("name")
    
    response = query.execute()
    return response.data


@router.get("/{program_id}", response_model=ProgramResponse)
async def get_program(program_id: int, db=Depends(get_db)):
    response = db.table("dim_program").select("*").eq("id", program_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Program not found")
    return response.data[0]


@router.post("", response_model=ProgramResponse, status_code=201)
async def create_program(data: ProgramCreate, db=Depends(get_db)):
    response = db.table("dim_program").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create program")
    return response.data[0]


@router.patch("/{program_id}", response_model=ProgramResponse)
async def update_program(
    program_id: int, data: ProgramUpdate, db=Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_program(program_id, db)
        
    response = db.table("dim_program").update(update_data).eq("id", program_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Program not found")
    return response.data[0]
