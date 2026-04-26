"""
ORM Model: dim_student
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


class Student(Base):
    __tablename__ = "dim_student"

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
    student_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    cin: Mapped[str | None] = mapped_column(String(20))
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    gender: Mapped[str | None] = mapped_column(String(10))
    birth_date = mapped_column(Date, nullable=True)
    region_origin: Mapped[str | None] = mapped_column(String(100))
    governorate: Mapped[str | None] = mapped_column(String(50))
    nationality: Mapped[str] = mapped_column(String(50), default="TN")
    academic_year: Mapped[str] = mapped_column(String(10), nullable=False)
    level: Mapped[str | None] = mapped_column(String(10))
    program_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_program.id")
    )
    status: Mapped[str] = mapped_column(String(20), default="enrolled", nullable=False)
    enrollment_date = mapped_column(Date, nullable=True)
    graduation_date = mapped_column(Date, nullable=True)
    dropout_date = mapped_column(Date, nullable=True)
    dropout_reason: Mapped[str | None] = mapped_column(String(100))
    transfer_to: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_institution.id")
    )
    is_scholarship: Mapped[bool] = mapped_column(Boolean, default=False)
    scholarship_type: Mapped[str | None] = mapped_column(String(50))
    is_foreign: Mapped[bool] = mapped_column(Boolean, default=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(30))
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", foreign_keys=[institution_id], lazy="selectin")
    department = relationship("Department", lazy="selectin")
    program = relationship("Program", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Student {self.student_code}: {self.first_name} {self.last_name}>"
