"""
API v1 — Auth (Supabase Auth)

Login/signup happens on the FRONTEND via Supabase JS SDK.
This endpoint just verifies tokens and syncs users to our DB.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import decode_supabase_token, get_current_user
from models.user import User
from schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """Get current authenticated user from Supabase token."""
    return UserResponse.model_validate(current_user)


@router.post("/sync")
async def sync_user(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sync Supabase auth user to our users table.
    Called by frontend after first login to ensure user exists in our DB.
    """
    current_user.last_login = datetime.now(timezone.utc)
    await db.flush()

    return {
        "status": "synced",
        "user": UserResponse.model_validate(current_user).model_dump(),
    }


@router.get("/verify")
async def verify_token(current_user=Depends(get_current_user)):
    """Quick token verification — returns 200 if valid, 401 if not."""
    return {"valid": True, "email": current_user.email, "role": current_user.role}
