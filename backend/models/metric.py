"""
ORM Model: dim_metric
"""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Metric(Base):
    __tablename__ = "dim_metric"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(255))
    name_ar: Mapped[str | None] = mapped_column(String(255))
    domain_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("dim_domain.id"))
    unit: Mapped[str | None] = mapped_column(String(30))
    aggregation: Mapped[str] = mapped_column(String(20), default="AVG")
    formula: Mapped[str | None] = mapped_column(Text)
    higher_is_better: Mapped[bool] = mapped_column(Boolean, default=True)
    warning_threshold: Mapped[float | None] = mapped_column(Numeric)
    critical_threshold: Mapped[float | None] = mapped_column(Numeric)
    benchmark_national: Mapped[float | None] = mapped_column(Numeric)
    description: Mapped[str | None] = mapped_column(Text)
    source_table: Mapped[str | None] = mapped_column(String(100))
    is_computed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    domain = relationship("Domain", back_populates="metrics")

    def __repr__(self) -> str:
        return f"<Metric {self.code}: {self.name}>"
