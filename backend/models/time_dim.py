"""
ORM Model: dim_time
"""

from __future__ import annotations

from sqlalchemy import Boolean, Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class TimeDimension(Base):
    __tablename__ = "dim_time"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_date: Mapped[str] = mapped_column(Date, unique=True, nullable=False)
    day: Mapped[int | None] = mapped_column(Integer)
    day_name: Mapped[str | None] = mapped_column(String(20))
    week_number: Mapped[int | None] = mapped_column(Integer)
    month: Mapped[int | None] = mapped_column(Integer)
    month_name: Mapped[str | None] = mapped_column(String(20))
    quarter: Mapped[int | None] = mapped_column(Integer)
    semester: Mapped[int | None] = mapped_column(Integer)
    academic_year: Mapped[str | None] = mapped_column(String(10))
    year: Mapped[int | None] = mapped_column(Integer)
    is_exam_period: Mapped[bool] = mapped_column(Boolean, default=False)
    is_holiday: Mapped[bool] = mapped_column(Boolean, default=False)
    is_weekend: Mapped[bool] = mapped_column(Boolean, default=False)

    def __repr__(self) -> str:
        return f"<Time {self.full_date} ({self.academic_year} S{self.semester})>"
