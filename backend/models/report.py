"""
ORM Model: reports
"""

from __future__ import annotations

import uuid
from sqlalchemy import BigInteger, Date, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), default=uuid.uuid4, unique=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    report_type: Mapped[str | None] = mapped_column(String(30))
    scope: Mapped[str | None] = mapped_column(String(20))
    institution_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_institution.id")
    )
    domain_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_domain.id")
    )
    period_start: Mapped[str | None] = mapped_column(Date)
    period_end: Mapped[str | None] = mapped_column(Date)
    generated_by: Mapped[str | None] = mapped_column(String(100))
    file_path: Mapped[str | None] = mapped_column(Text)
    format: Mapped[str | None] = mapped_column(String(10))
    ai_summary: Mapped[str | None] = mapped_column(Text)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    domain = relationship("Domain", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Report {self.title}>"
