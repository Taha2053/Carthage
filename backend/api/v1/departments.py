"""
API v1 — Departments CRUD
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from core.database import get_db
from schemas.department import DepartmentCreate, DepartmentResponse, DepartmentUpdate

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("", response_model=list[DepartmentResponse])
async def list_departments(
    institution_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    db=Depends(get_db),
):
    query = db.table("dim_department").select("*")
    if institution_id is not None:
        query = query.eq("institution_id", institution_id)
    if is_active is not None:
        query = query.eq("is_active", is_active)
    query = query.order("name")
    
    response = query.execute()
    return response.data


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(department_id: int, db=Depends(get_db)):
    response = db.table("dim_department").select("*").eq("id", department_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Department not found")
    return response.data[0]


@router.post("", response_model=DepartmentResponse, status_code=201)
async def create_department(data: DepartmentCreate, db=Depends(get_db)):
    response = db.table("dim_department").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create department")
    return response.data[0]


@router.patch("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int,
    data: DepartmentUpdate,
    db=Depends(get_db),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_department(department_id, db)
        
    response = db.table("dim_department").update(update_data).eq("id", department_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Department not found")
    return response.data[0]
