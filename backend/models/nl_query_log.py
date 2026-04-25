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
    user_id: Mapped[str | None] = mapped_column(String(100))
    institution_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_institution.id")
    )
    raw_query: Mapped[str] = mapped_column(Text, nullable=False)
    generated_sql: Mapped[str | None] = mapped_column(Text)
    result_summary: Mapped[str | None] = mapped_column(Text)
    execution_ms: Mapped[int | None] = mapped_column(Integer)
    was_successful: Mapped[bool | None] = mapped_column(Boolean)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<NLQuery '{self.raw_query[:50]}...'>"
