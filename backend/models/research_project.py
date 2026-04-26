"""
ORM Model: dim_research_project
"""

from __future__ import annotations

from sqlalchemy import (
    BigInteger, Date, ForeignKey, Integer, Numeric, String, Text, DateTime,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class ResearchProject(Base):
    __tablename__ = "dim_research_project"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    reference: Mapped[str | None] = mapped_column(String(100), unique=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_fr: Mapped[str | None] = mapped_column(String(500))
    project_type: Mapped[str | None] = mapped_column(String(30))
    research_unit: Mapped[str | None] = mapped_column(String(255))
    laboratory: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str | None] = mapped_column(String(20))
    start_date = mapped_column(Date, nullable=True)
    end_date = mapped_column(Date, nullable=True)
    budget_tnd: Mapped[float | None] = mapped_column(Numeric(12, 2))
    budget_currency: Mapped[str] = mapped_column(String(3), default="TND")
    funding_source: Mapped[str | None] = mapped_column(String(255))
    lead_researcher: Mapped[str | None] = mapped_column(String(255))
    lead_staff_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("dim_staff.id")
    )
    partner_institutions = mapped_column(ARRAY(Text), nullable=True)
    keywords = mapped_column(ARRAY(Text), nullable=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    lead_staff = relationship("Staff", lazy="selectin")

    def __repr__(self) -> str:
        return f"<ResearchProject {self.reference}: {self.title[:50]}>"
