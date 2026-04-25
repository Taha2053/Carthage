"""
Pydantic Schemas — Report
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReportGenerateRequest(BaseModel):
    title: str
    report_type: str = "summary"  # summary, academic, finance, hr, full
    scope: str = "institution"  # institution, university, department
    institution_id: Optional[int] = None
    domain_id: Optional[int] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    format: str = "pdf"  # pdf, excel


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    title: str
    report_type: Optional[str] = None
    scope: Optional[str] = None
    institution_id: Optional[int] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    generated_by: Optional[str] = None
    file_path: Optional[str] = None
    format: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: Optional[datetime] = None
