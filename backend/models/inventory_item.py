"""
ORM Model: dim_inventory_item
"""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class InventoryItem(Base):
    __tablename__ = "dim_inventory_item"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    code: Mapped[str | None] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(50))
    unit: Mapped[str | None] = mapped_column(String(20))
    min_stock_level: Mapped[float | None] = mapped_column(Numeric(10, 2), default=0)
    reorder_point: Mapped[float | None] = mapped_column(Numeric(10, 2), default=0)
    unit_cost: Mapped[float | None] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")

    def __repr__(self) -> str:
        return f"<InventoryItem {self.code}: {self.name}>"
