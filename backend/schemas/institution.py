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
    short_name: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    institution_type: Optional[str] = None
    founding_year: Optional[int] = None
    student_capacity: Optional[int] = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    institution_type: Optional[str] = None
    student_capacity: Optional[int] = None
    is_active: Optional[bool] = None


class InstitutionResponse(InstitutionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    uuid: UUID
    is_active: bool
    created_at: Optional[datetime] = None


class InstitutionSummary(InstitutionResponse):
    """Extended response with aggregated KPI + alert counts."""
    kpi_count: int = 0
    alert_count: int = 0
    critical_alerts: int = 0
    data_quality_score: Optional[float] = None
    department_count: int = 0
