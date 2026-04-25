"""
ORM Model: dim_institution
"""

from __future__ import annotations

from sqlalchemy import Boolean, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

import uuid
from core.database import Base


class Institution(Base):
    __tablename__ = "dim_institution"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False
    )
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    short_name: Mapped[str | None] = mapped_column(String(50))
    city: Mapped[str | None] = mapped_column(String(100))
    region: Mapped[str | None] = mapped_column(String(100))
    institution_type: Mapped[str | None] = mapped_column(String(50))
    founding_year: Mapped[int | None] = mapped_column(Integer)
    student_capacity: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    departments = relationship("Department", back_populates="institution", lazy="selectin")
    fact_kpis = relationship("FactKPI", back_populates="institution", lazy="noload")
    alerts = relationship("Alert", back_populates="institution", lazy="noload")

    def __repr__(self) -> str:
        return f"<Institution {self.code}: {self.name}>"
