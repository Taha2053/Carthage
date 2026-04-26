"""
Pydantic Schemas — Equipment
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EquipmentBase(BaseModel):
    institution_id: int
    space_id: Optional[int] = None
    asset_code: Optional[str] = None
    name: str
    category: Optional[str] = None
    sub_category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    currency: str = "TND"
    supplier: Optional[str] = None
    status: str = "operational"
    condition_score: Optional[int] = None
    warranty_end: Optional[date] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    space_id: Optional[int] = None
    name: Optional[str] = None
    status: Optional[str] = None
    condition_score: Optional[int] = None
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None
    is_active: Optional[bool] = None


class EquipmentResponse(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
