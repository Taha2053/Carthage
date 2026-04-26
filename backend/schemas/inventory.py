"""
Pydantic Schemas — Inventory
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InventoryItemBase(BaseModel):
    institution_id: int
    code: Optional[str] = None
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    min_stock_level: float = 0
    reorder_point: float = 0
    unit_cost: Optional[float] = None


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    min_stock_level: Optional[float] = None
    reorder_point: Optional[float] = None
    unit_cost: Optional[float] = None
    is_active: Optional[bool] = None


class InventoryItemResponse(InventoryItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: Optional[datetime] = None
