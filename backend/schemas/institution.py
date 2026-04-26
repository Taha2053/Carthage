"""
Pydantic Schemas — Institution
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InstitutionBase(BaseModel):
    code: str
    name: str
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    short_name: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    institution_type: Optional[str] = None
    governing_body: Optional[str] = None
    founding_year: Optional[int] = None
    student_capacity: Optional[int] = None
    current_enrollment: Optional[int] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    rector_name: Optional[str] = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    short_name: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    institution_type: Optional[str] = None
    governing_body: Optional[str] = None
    student_capacity: Optional[int] = None
    current_enrollment: Optional[int] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    rector_name: Optional[str] = None
    is_active: Optional[bool] = None


class InstitutionResponse(InstitutionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class InstitutionSummary(InstitutionResponse):
    """Extended response with aggregated KPI + alert counts."""
    kpi_count: int = 0
    alert_count: int = 0
    critical_alerts: int = 0
    data_quality_score: Optional[float] = None
    department_count: int = 0
    student_count: int = 0
    staff_count: int = 0
