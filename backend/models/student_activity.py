"""
ORM Model: dim_student_activity
"""

from __future__ import annotations

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class StudentActivity(Base):
    __tablename__ = "dim_student_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    activity_type: Mapped[str | None] = mapped_column(String(30))
    description: Mapped[str | None] = mapped_column(Text)
    president_name: Mapped[str | None] = mapped_column(String(255))
    member_count: Mapped[int] = mapped_column(Integer, default=0)
    founding_date = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")

    def __repr__(self) -> str:
        return f"<StudentActivity {self.name} ({self.activity_type})>"
