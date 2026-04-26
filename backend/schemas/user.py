"""
Pydantic Schemas — User & Auth
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserCreate(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "viewer"
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    auth_provider: str = "local"
    password: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    email: str
    full_name: Optional[str] = None
    role: Optional[str] = None
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    auth_provider: str = "local"
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
