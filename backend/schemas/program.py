"""
Pydantic Schemas — Program
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProgramBase(BaseModel):
    institution_id: int
    department_id: Optional[int] = None
    code: str
    name: str
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    degree_type: Optional[str] = None
    cycle: Optional[str] = None
    duration_years: Optional[int] = None
    total_credits: Optional[int] = None
    language: str = "fr"
    is_professional: bool = False
    accreditation_date: Optional[date] = None
    accreditation_end: Optional[date] = None
    ministry_reference: Optional[str] = None


class ProgramCreate(ProgramBase):
    pass


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    degree_type: Optional[str] = None
    duration_years: Optional[int] = None
    total_credits: Optional[int] = None
    is_professional: Optional[bool] = None
    accreditation_end: Optional[date] = None
    is_active: Optional[bool] = None


class ProgramResponse(ProgramBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: Optional[datetime] = None
