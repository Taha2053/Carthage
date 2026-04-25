"""
ORM Model: dim_partnership
"""

from __future__ import annotations

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Partnership(Base):
    __tablename__ = "dim_partnership"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    partner_name: Mapped[str] = mapped_column(String(255), nullable=False)
    partner_type: Mapped[str | None] = mapped_column(String(30))
    partnership_type: Mapped[str | None] = mapped_column(String(30))
    scope: Mapped[str | None] = mapped_column(String(20))
    country: Mapped[str | None] = mapped_column(String(100))
    city: Mapped[str | None] = mapped_column(String(100))
    signing_date = mapped_column(Date, nullable=True)
    start_date = mapped_column(Date, nullable=True)
    end_date = mapped_column(Date, nullable=True)
    renewal_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="active")
    student_beneficiaries: Mapped[int] = mapped_column(Integer, default=0)
    staff_beneficiaries: Mapped[int] = mapped_column(Integer, default=0)
    financial_value: Mapped[float | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="TND")
    description: Mapped[str | None] = mapped_column(Text)
    contact_name: Mapped[str | None] = mapped_column(String(255))
    contact_email: Mapped[str | None] = mapped_column(String(255))
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Partnership {self.partner_name} ({self.partnership_type})>"
