"""
ORM Model: dim_staff
"""

from __future__ import annotations

import uuid
from sqlalchemy import (
    BigInteger, Boolean, Date, ForeignKey, Integer, String, DateTime,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Staff(Base):
    __tablename__ = "dim_staff"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), default=uuid.uuid4, unique=True
    )
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    department_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_department.id")
    )
    staff_code: Mapped[str | None] = mapped_column(String(50), unique=True)
    cin: Mapped[str | None] = mapped_column(String(20))
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    gender: Mapped[str | None] = mapped_column(String(10))
    birth_year: Mapped[int | None] = mapped_column(Integer)
    nationality: Mapped[str] = mapped_column(String(50), default="TN")
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    rank: Mapped[str | None] = mapped_column(String(50))
    specialty: Mapped[str | None] = mapped_column(String(100))
    contract_type: Mapped[str | None] = mapped_column(String(30))
    hire_date = mapped_column(Date, nullable=True)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    departure_date = mapped_column(Date, nullable=True)
    departure_reason: Mapped[str | None] = mapped_column(String(50))
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    department = relationship("Department", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Staff {self.staff_code}: {self.first_name} {self.last_name} ({self.category})>"
