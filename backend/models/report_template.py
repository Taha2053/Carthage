"""
ORM Model: report_templates
"""

from __future__ import annotations

import uuid
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class ReportTemplate(Base):
    __tablename__ = "report_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), default=uuid.uuid4, unique=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    scope: Mapped[str | None] = mapped_column(String(20))
    frequency: Mapped[str | None] = mapped_column(String(20))
    domain_ids = mapped_column(ARRAY(Integer), nullable=True)
    metric_codes = mapped_column(ARRAY(String(60)), nullable=True)
    include_charts: Mapped[bool] = mapped_column(Boolean, default=True)
    include_ai_summary: Mapped[bool] = mapped_column(Boolean, default=True)
    include_benchmarks: Mapped[bool] = mapped_column(Boolean, default=True)
    layout_config = mapped_column(JSONB, nullable=True)
    output_formats = mapped_column(ARRAY(String(10)), nullable=True)
    auto_send_to: Mapped[str | None] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id")
    )
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<ReportTemplate {self.name}>"
