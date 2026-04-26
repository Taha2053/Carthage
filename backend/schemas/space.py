"""
Pydantic Schemas — Space
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SpaceBase(BaseModel):
    institution_id: int
    code: Optional[str] = None
    name: Optional[str] = None
    space_type: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    area_m2: Optional[float] = None
    has_projector: bool = False
    has_smartboard: bool = False
    has_ac: bool = False
    has_wifi: bool = False
    is_accessible: bool = False
    last_renovation: Optional[date] = None


class SpaceCreate(SpaceBase):
    pass


class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    space_type: Optional[str] = None
    capacity: Optional[int] = None
    area_m2: Optional[float] = None
    has_projector: Optional[bool] = None
    has_smartboard: Optional[bool] = None
    has_ac: Optional[bool] = None
    has_wifi: Optional[bool] = None
    is_accessible: Optional[bool] = None
    is_active: Optional[bool] = None
    last_renovation: Optional[date] = None


class SpaceResponse(SpaceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: Optional[datetime] = None


class SpaceOccupancyResponse(BaseModel):
    """Read-only response for fact_space_occupancy."""
    space_id: int
    institution_id: int
    time_id: int
    total_slots: Optional[int] = None
    used_slots: Optional[int] = None
    occupancy_rate: Optional[float] = None
    peak_hour: Optional[str] = None
    avg_occupants: Optional[float] = None
