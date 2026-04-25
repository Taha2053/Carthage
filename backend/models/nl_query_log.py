"""
ORM Model: nl_query_log
"""

from __future__ import annotations

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from core.database import Base


class NLQueryLog(Base):
    __tablename__ = "nl_query_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id")
    )
    institution_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_institution.id")
    )
    raw_query: Mapped[str] = mapped_column(Text, nullable=False)
    detected_intent: Mapped[str | None] = mapped_column(String(50))
    detected_domain: Mapped[str | None] = mapped_column(String(30))
    detected_metric: Mapped[str | None] = mapped_column(String(60))
    detected_period: Mapped[str | None] = mapped_column(String(50))
    generated_sql: Mapped[str | None] = mapped_column(Text)
    result_summary: Mapped[str | None] = mapped_column(Text)
    result_row_count: Mapped[int | None] = mapped_column(Integer)
    execution_ms: Mapped[int | None] = mapped_column(Integer)
    was_successful: Mapped[bool | None] = mapped_column(Boolean)
    user_rating: Mapped[int | None] = mapped_column(Integer)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<NLQuery '{self.raw_query[:50]}...'>"
