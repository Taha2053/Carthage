"""
Pydantic Schemas — Training
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TrainingProgramBase(BaseModel):
    institution_id: int
    code: Optional[str] = None
    name: str
    target_audience: Optional[str] = None
    training_type: Optional[str] = None
    domain_id: Optional[int] = None
    duration_hours: Optional[float] = None
    provider: Optional[str] = None
    is_external: bool = False
    cost_tnd: float = 0
    is_certified: bool = False
    certification_body: Optional[str] = None
    academic_year: Optional[str] = None


class TrainingProgramCreate(TrainingProgramBase):
    pass


class TrainingProgramUpdate(BaseModel):
    name: Optional[str] = None
    duration_hours: Optional[float] = None
    provider: Optional[str] = None
    cost_tnd: Optional[float] = None
    is_certified: Optional[bool] = None
    is_active: Optional[bool] = None


class TrainingProgramResponse(TrainingProgramBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: Optional[datetime] = None
