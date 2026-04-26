"""
ORM Model: dim_equipment
"""

from __future__ import annotations

from sqlalchemy import (
    BigInteger, Boolean, Date, ForeignKey, Integer, Numeric, String, DateTime,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Equipment(Base):
    __tablename__ = "dim_equipment"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    space_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_space.id")
    )
    asset_code: Mapped[str | None] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(50))
    sub_category: Mapped[str | None] = mapped_column(String(100))
    brand: Mapped[str | None] = mapped_column(String(100))
    model: Mapped[str | None] = mapped_column(String(100))
    serial_number: Mapped[str | None] = mapped_column(String(100))
    purchase_date = mapped_column(Date, nullable=True)
    purchase_price: Mapped[float | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="TND")
    supplier: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="operational")
    condition_score: Mapped[int | None] = mapped_column(Integer)
    last_maintenance = mapped_column(Date, nullable=True)
    next_maintenance = mapped_column(Date, nullable=True)
    warranty_end = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    space = relationship("Space", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Equipment {self.asset_code}: {self.name} ({self.status})>"
