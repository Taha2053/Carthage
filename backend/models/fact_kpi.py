"""
ORM Model: fact_kpis
"""

from __future__ import annotations

from sqlalchemy import (
    BigInteger, Boolean, ForeignKey, Integer, Numeric, String, Text, DateTime,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class FactKPI(Base):
    __tablename__ = "fact_kpis"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    department_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_department.id")
    )
    time_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_time.id"), nullable=False
    )
    metric_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_metric.id"), nullable=False
    )
    value: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    value_previous: Mapped[float | None] = mapped_column(Numeric(15, 4))
    # delta_pct is GENERATED ALWAYS — read only
    delta_pct: Mapped[float | None] = mapped_column(Numeric(8, 2), insert_default=None)
    source: Mapped[str] = mapped_column(String(50), default="computed")
    is_estimated: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence: Mapped[float | None] = mapped_column(Numeric(4, 2))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", back_populates="fact_kpis")
    department = relationship("Department", lazy="selectin")
    metric = relationship("Metric", lazy="selectin")
    time_dim = relationship("TimeDimension", lazy="selectin")

    def __repr__(self) -> str:
        return f"<FactKPI inst={self.institution_id} metric={self.metric_id} val={self.value}>"
