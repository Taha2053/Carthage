"""
ORM Model: dim_domain
"""

from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Domain(Base):
    __tablename__ = "dim_domain"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(100))
    name_ar: Mapped[str | None] = mapped_column(String(100))
    icon: Mapped[str | None] = mapped_column(String(10))
    color_hex: Mapped[str | None] = mapped_column(String(7))
    display_order: Mapped[int | None] = mapped_column(Integer)

    # Relationships
    metrics = relationship("Metric", back_populates="domain", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Domain {self.code}: {self.name}>"
