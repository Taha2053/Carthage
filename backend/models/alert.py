"""
ORM Model: alerts
"""

from __future__ import annotations

from sqlalchemy import (
    BigInteger, Boolean, ForeignKey, Integer, Numeric, String, Text, DateTime,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    department_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_department.id")
    )
    metric_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_metric.id"), nullable=False
    )
    time_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_time.id"), nullable=False
    )
    fact_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("fact_kpis.id")
    )
    severity: Mapped[str] = mapped_column(String(10), nullable=False)
    alert_type: Mapped[str] = mapped_column(String(30), default="threshold")
    value: Mapped[float | None] = mapped_column(Numeric(15, 4))
    threshold: Mapped[float | None] = mapped_column(Numeric(15, 4))
    delta_pct: Mapped[float | None] = mapped_column(Numeric(8, 2))
    message: Mapped[str | None] = mapped_column(Text)
    explanation: Mapped[str | None] = mapped_column(Text)
    recommended_action: Mapped[str | None] = mapped_column(Text)
    priority_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_by: Mapped[str | None] = mapped_column(String(255))
    resolved_at = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_note: Mapped[str | None] = mapped_column(Text)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", back_populates="alerts")
    department = relationship("Department", lazy="selectin")
    metric = relationship("Metric", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Alert {self.severity} inst={self.institution_id} metric={self.metric_id}>"
