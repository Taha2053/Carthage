"""
API v1 — Users CRUD
"""

from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserResponse])
async def list_users(
    institution_id: Optional[int] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db=Depends(get_db),
):
    query = db.table("users").select("*")
    if institution_id is not None:
        query = query.eq("institution_id", institution_id)
    if role:
        query = query.eq("role", role)
    if is_active is not None:
        query = query.eq("is_active", is_active)
    query = query.order("email")
    
    response = query.execute()
    return response.data


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db=Depends(get_db)):
    response = db.table("users").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(data: UserCreate, db=Depends(get_db)):
    # Note: For production, password hashing and real Supabase Auth integration is needed
    response = db.table("users").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create user")
    return response.data[0]


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db=Depends(get_db),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_user(user_id, db)
        
    response = db.table("users").update(update_data).eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]
