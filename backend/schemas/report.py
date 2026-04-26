"""
Pydantic Schemas — Report
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReportCreate(BaseModel):
    title: str
    report_type: str = "summary"
    scope: str = "institution"
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    domain_id: Optional[int] = None
    template_id: Optional[int] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    academic_year: Optional[str] = None
    format: str = "pdf"
    
class ReportUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = None
    ai_summary: Optional[str] = None


class ReportGenerateRequest(BaseModel):
    title: str
    report_type: str = "summary"  # academic, finance, hr, esg, research, global
    scope: str = "institution"  # institution, network, department
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    domain_id: Optional[int] = None
    template_id: Optional[int] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    academic_year: Optional[str] = None
    format: str = "pdf"  # pdf, xlsx, html


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    template_id: Optional[int] = None
    title: str
    report_type: Optional[str] = None
    scope: Optional[str] = None
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    academic_year: Optional[str] = None
    generated_by: Optional[int] = None
    generation_type: str = "on_demand"
    file_path: Optional[str] = None
    format: Optional[str] = None
    file_size_bytes: Optional[int] = None
    ai_summary: Optional[str] = None
    status: str = "generating"
    download_count: int = 0
    created_at: Optional[datetime] = None
