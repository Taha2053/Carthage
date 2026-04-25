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
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db

security_scheme = HTTPBearer(auto_error=False)


def decode_supabase_token(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT token.
    
    Supabase JWTs contain:
    - sub: user UUID (from auth.users)
    - email: user email
    - role: 'authenticated' or 'anon'
    - aud: 'authenticated'
    """
    jwt_secret = settings.SUPABASE_JWT_SECRET

    if not jwt_secret:
        # Fallback: skip verification in dev mode (not recommended for prod)
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
    db: AsyncSession = Depends(get_db),
):
    """
    FastAPI dependency — extracts current user from Supabase JWT.
    
    1. Decodes the Supabase JWT
    2. Looks up the user in our `users` table by email
    3. Returns the user ORM object
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required — pass Supabase token in Authorization header",
        )

    payload = decode_supabase_token(credentials.credentials)

    # Supabase puts email in the token
    user_email = payload.get("email")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing email claim",
        )

    # Look up in our users table
    from models.user import User

    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in system or inactive",
        )
    return user


def require_roles(*allowed_roles: str):
    """
    Dependency factory — restrict access to specific roles.
    
    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("superadmin"))])
    """
    async def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user
    return role_checker
