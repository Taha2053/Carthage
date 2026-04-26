"""
Pydantic Schemas — Department
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DepartmentBase(BaseModel):
    institution_id: int
    code: str
    name: str
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    field: Optional[str] = None
    specialty: Optional[str] = None
    head_name: Optional[str] = None
    head_email: Optional[str] = None
    student_count: Optional[int] = None
    staff_count: Optional[int] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    field: Optional[str] = None
    specialty: Optional[str] = None
    head_name: Optional[str] = None
    head_email: Optional[str] = None
    student_count: Optional[int] = None
    staff_count: Optional[int] = None
    is_active: Optional[bool] = None


class DepartmentResponse(DepartmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
