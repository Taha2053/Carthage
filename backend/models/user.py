"""
ORM Model: users
"""

from __future__ import annotations

import uuid
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), default=uuid.uuid4, unique=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str | None] = mapped_column(String(30))
    institution_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_institution.id")
    )
    department_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("dim_department.id")
    )
    auth_provider: Mapped[str] = mapped_column(String(20), default="local")
    password_hash: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login = mapped_column(DateTime(timezone=True), nullable=True)
    failed_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until = mapped_column(DateTime(timezone=True), nullable=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    institution = relationship("Institution", lazy="selectin")
    department = relationship("Department", lazy="selectin")

    def __repr__(self) -> str:
        return f"<User {self.email} role={self.role}>"
