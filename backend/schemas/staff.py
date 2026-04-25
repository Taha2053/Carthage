"""
Pydantic Schemas — Staff
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StaffBase(BaseModel):
    institution_id: int
    department_id: Optional[int] = None
    staff_code: Optional[str] = None
    cin: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    birth_year: Optional[int] = None
    nationality: str = "TN"
    category: str
    rank: Optional[str] = None
    specialty: Optional[str] = None
    contract_type: Optional[str] = None
    hire_date: Optional[date] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    department_id: Optional[int] = None
    rank: Optional[str] = None
    specialty: Optional[str] = None
    contract_type: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    departure_date: Optional[date] = None
    departure_reason: Optional[str] = None


class StaffResponse(StaffBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    is_active: bool
    departure_date: Optional[date] = None
    departure_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
