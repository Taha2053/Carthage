"""
Pydantic Schemas — Student
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StudentBase(BaseModel):
    institution_id: int
    department_id: Optional[int] = None
    student_code: str
    cin: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    region_origin: Optional[str] = None
    governorate: Optional[str] = None
    nationality: str = "TN"
    academic_year: str
    level: Optional[str] = None
    program_id: Optional[int] = None
    status: str = "enrolled"
    enrollment_date: Optional[date] = None
    is_scholarship: bool = False
    scholarship_type: Optional[str] = None
    is_foreign: bool = False
    email: Optional[str] = None
    phone: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    department_id: Optional[int] = None
    level: Optional[str] = None
    program_id: Optional[int] = None
    status: Optional[str] = None
    graduation_date: Optional[date] = None
    dropout_date: Optional[date] = None
    dropout_reason: Optional[str] = None
    transfer_to: Optional[int] = None
    is_scholarship: Optional[bool] = None
    scholarship_type: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    graduation_date: Optional[date] = None
    dropout_date: Optional[date] = None
    dropout_reason: Optional[str] = None
    transfer_to: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class StudentSummary(BaseModel):
    """Aggregated student statistics for an institution."""
    institution_id: int
    total_enrolled: int = 0
    total_graduated: int = 0
    total_dropout: int = 0
    total_repeating: int = 0
    scholarship_count: int = 0
    foreign_count: int = 0
    gender_breakdown: dict = {}
    level_breakdown: dict = {}
