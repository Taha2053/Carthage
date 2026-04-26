"""
ORM Model: dim_program
"""

from __future__ import annotations

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Program(Base):
    __tablename__ = "dim_program"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    department_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_department.id")
    )
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(255))
    name_ar: Mapped[str | None] = mapped_column(String(255))
    degree_type: Mapped[str | None] = mapped_column(String(20))
    cycle: Mapped[str | None] = mapped_column(String(10))
    duration_years: Mapped[int | None] = mapped_column(Integer)
    total_credits: Mapped[int | None] = mapped_column(Integer)
    language: Mapped[str] = mapped_column(String(20), default="fr")
    is_professional: Mapped[bool] = mapped_column(Boolean, default=False)
    accreditation_date = mapped_column(Date, nullable=True)
    accreditation_end = mapped_column(Date, nullable=True)
    ministry_reference: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    department = relationship("Department", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Program {self.code}: {self.name}>"
