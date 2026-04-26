"""
ORM Model: dim_space
"""

from __future__ import annotations

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Space(Base):
    __tablename__ = "dim_space"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    code: Mapped[str | None] = mapped_column(String(50))
    name: Mapped[str | None] = mapped_column(String(255))
    space_type: Mapped[str | None] = mapped_column(String(30))
    building: Mapped[str | None] = mapped_column(String(100))
    floor: Mapped[int | None] = mapped_column(Integer)
    capacity: Mapped[int | None] = mapped_column(Integer)
    area_m2: Mapped[float | None] = mapped_column(Numeric(8, 2))
    has_projector: Mapped[bool] = mapped_column(Boolean, default=False)
    has_smartboard: Mapped[bool] = mapped_column(Boolean, default=False)
    has_ac: Mapped[bool] = mapped_column(Boolean, default=False)
    has_wifi: Mapped[bool] = mapped_column(Boolean, default=False)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_renovation = mapped_column(Date, nullable=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Space {self.code}: {self.name} ({self.space_type})>"
