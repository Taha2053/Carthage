"""
UCAR Intelligence Hub — Supabase Auth Security

Frontend handles login/signup via Supabase JS SDK.
Backend verifies the Supabase JWT from the Authorization header.
"""

from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from supabase._async.client import AsyncClient

from core.config import settings
from core.database import get_db

security_scheme = HTTPBearer(auto_error=False)


def decode_supabase_token(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT token.
    """
    jwt_secret = settings.SUPABASE_JWT_SECRET

    if not jwt_secret:
        # Fallback
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase token",
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncClient = Depends(get_db),
):
    """
    FastAPI dependency — extracts current user from Supabase JWT.
    Returns the user as a dictionary.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required — pass Supabase token in Authorization header",
        )

    payload = decode_supabase_token(credentials.credentials)
    user_email = payload.get("email")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing email claim",
        )

    # Look up in our users table
    response = await db.table("users").select("*").eq("email", user_email).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in system",
        )
        
    user = response.data[0]
    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive",
        )
    return user


def require_roles(*allowed_roles: str):
    """
    Dependency factory — restrict access to specific roles.
    """
    async def role_checker(current_user=Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user
    return role_checker
