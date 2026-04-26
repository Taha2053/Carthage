"""
Pydantic Schemas — Partnership
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PartnershipBase(BaseModel):
    institution_id: int
    partner_name: str
    partner_type: Optional[str] = None
    partnership_type: Optional[str] = None
    scope: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    signing_date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "active"
    student_beneficiaries: int = 0
    staff_beneficiaries: int = 0
    financial_value: Optional[float] = None
    currency: str = "TND"
    description: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None


class PartnershipCreate(PartnershipBase):
    pass


class PartnershipUpdate(BaseModel):
    partner_name: Optional[str] = None
    partner_type: Optional[str] = None
    partnership_type: Optional[str] = None
    scope: Optional[str] = None
    status: Optional[str] = None
    end_date: Optional[date] = None
    renewal_count: Optional[int] = None
    student_beneficiaries: Optional[int] = None
    staff_beneficiaries: Optional[int] = None
    financial_value: Optional[float] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None


class PartnershipResponse(PartnershipBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    renewal_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
