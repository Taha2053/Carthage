"""
API v1 — Auth (Supabase Auth)

Login/signup happens on the FRONTEND via Supabase JS SDK.
This endpoint just verifies tokens and syncs users to our DB.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from core.database import get_db
from core.security import get_current_user
from schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """Get current authenticated user from Supabase token."""
    return current_user


@router.post("/sync")
async def sync_user(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Sync Supabase auth user to our users table.
    Called by frontend after first login to ensure user exists in our DB.
    """
    user_id = current_user.get("id")
    update_data = {
        "last_login": datetime.now(timezone.utc).isoformat()
    }
    
    resp = db.table("users").update(update_data).eq("id", user_id).execute()
    updated_user = resp.data[0] if resp.data else current_user

    return {
        "status": "synced",
        "user": updated_user,
    }


@router.get("/verify")
async def verify_token(current_user=Depends(get_current_user)):
    """Quick token verification — returns 200 if valid, 401 if not."""
    return {"valid": True, "email": current_user.get("email"), "role": current_user.get("role")}
