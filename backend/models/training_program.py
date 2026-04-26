"""
ORM Model: dim_training_program
"""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class TrainingProgram(Base):
    __tablename__ = "dim_training_program"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    code: Mapped[str | None] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_audience: Mapped[str | None] = mapped_column(String(30))
    training_type: Mapped[str | None] = mapped_column(String(30))
    domain_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_domain.id")
    )
    duration_hours: Mapped[float | None] = mapped_column(Numeric(7, 2))
    provider: Mapped[str | None] = mapped_column(String(255))
    is_external: Mapped[bool] = mapped_column(Boolean, default=False)
    cost_tnd: Mapped[float | None] = mapped_column(Numeric(10, 2), default=0)
    is_certified: Mapped[bool] = mapped_column(Boolean, default=False)
    certification_body: Mapped[str | None] = mapped_column(String(255))
    academic_year: Mapped[str | None] = mapped_column(String(10))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    domain = relationship("Domain", lazy="selectin")

    def __repr__(self) -> str:
        return f"<TrainingProgram {self.code}: {self.name}>"
