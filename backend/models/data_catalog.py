"""
ORM Model: data_catalog — searchable catalog of all datasets
"""

from __future__ import annotations

from sqlalchemy import BigInteger, ForeignKey, Integer, Numeric, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class DataCatalog(Base):
    __tablename__ = "data_catalog"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    domain_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_domain.id")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    data_type: Mapped[str] = mapped_column(String(50))  # excel, pdf, report, kpi_dataset
    source: Mapped[str | None] = mapped_column(String(100))
    record_count: Mapped[int | None] = mapped_column(Integer)
    
    # Usage tracking
    access_count: Mapped[int] = mapped_column(Integer, default=0)
    last_accessed = mapped_column(DateTime(timezone=True), nullable=True)
    relevance_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    storage_tier: Mapped[str] = mapped_column(String(10), default="hot")

    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    domain = relationship("Domain", lazy="selectin")

    def __repr__(self) -> str:
        return f"<DataCatalog {self.name} @ inst={self.institution_id}>"
