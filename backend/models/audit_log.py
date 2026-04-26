"""
ORM Model: audit_log
"""

from __future__ import annotations

from sqlalchemy import BigInteger, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id")
    )
    user_email: Mapped[str | None] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(50))
    entity_id: Mapped[int | None] = mapped_column(BigInteger)
    old_value = mapped_column(JSONB, nullable=True)
    new_value = mapped_column(JSONB, nullable=True)
    ip_address = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text)
    institution_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_institution.id")
    )
    description: Mapped[str | None] = mapped_column(Text)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} by={self.user_email}>"
