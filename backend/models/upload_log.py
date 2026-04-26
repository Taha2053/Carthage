"""
ORM Model: upload_log — tracks every file upload for data lifecycle management
"""

from __future__ import annotations

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, Numeric, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class UploadLog(Base):
    __tablename__ = "upload_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dim_institution.id"), nullable=False
    )
    domain_code: Mapped[str | None] = mapped_column(String(30))
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger)
    file_hash: Mapped[str | None] = mapped_column(String(64))  # SHA-256 for dedup
    file_format: Mapped[str | None] = mapped_column(String(10))
    rows_parsed: Mapped[int | None] = mapped_column(Integer)
    rows_inserted: Mapped[int | None] = mapped_column(Integer)
    rows_updated: Mapped[int | None] = mapped_column(Integer)
    rows_failed: Mapped[int | None] = mapped_column(Integer)
    rows_duplicate: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    error_message: Mapped[str | None] = mapped_column(Text)
    data_quality_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    uploaded_by: Mapped[str | None] = mapped_column(String(255))
    processed_by: Mapped[str | None] = mapped_column(String(100))
    processing_ms: Mapped[int | None] = mapped_column(Integer)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)

    # Data lifecycle tracking
    access_count: Mapped[int] = mapped_column(Integer, default=0)
    last_accessed = mapped_column(DateTime(timezone=True), nullable=True)
    relevance_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    storage_tier: Mapped[str] = mapped_column(String(10), default="hot")
    archived_at = mapped_column(DateTime(timezone=True), nullable=True)
    archive_path: Mapped[str | None] = mapped_column(Text)

    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Upload {self.filename} status={self.status}>"
