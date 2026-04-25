"""
Pydantic Schemas — Research
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class ResearchProjectBase(BaseModel):
    institution_id: int
    reference: Optional[str] = None
    title: str
    title_fr: Optional[str] = None
    project_type: Optional[str] = None
    research_unit: Optional[str] = None
    laboratory: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_tnd: Optional[float] = None
    budget_currency: str = "TND"
    funding_source: Optional[str] = None
    lead_researcher: Optional[str] = None
    lead_staff_id: Optional[int] = None
    partner_institutions: Optional[List[str]] = None
    keywords: Optional[List[str]] = None


class ResearchProjectCreate(ResearchProjectBase):
    pass


class ResearchProjectUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    end_date: Optional[date] = None
    budget_tnd: Optional[float] = None
    funding_source: Optional[str] = None
    lead_researcher: Optional[str] = None
    lead_staff_id: Optional[int] = None
    keywords: Optional[List[str]] = None


class ResearchProjectResponse(ResearchProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ResearchOutputResponse(BaseModel):
    """Read-only response for fact_research_output."""
    id: int
    institution_id: int
    department_id: Optional[int] = None
    project_id: Optional[int] = None
    output_type: Optional[str] = None
    title: Optional[str] = None
    journal_name: Optional[str] = None
    conference_name: Optional[str] = None
    indexing: Optional[str] = None
    impact_factor: Optional[float] = None
    doi: Optional[str] = None
    is_international: bool = False
    co_authors_count: int = 1
    citations_count: int = 0
