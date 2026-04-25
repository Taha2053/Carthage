"""
Pydantic Schemas — Alert
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    institution_id: int
    institution_name: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    metric_id: int
    metric_code: Optional[str] = None
    metric_name: Optional[str] = None
    severity: str
    value: Optional[float] = None
    threshold: Optional[float] = None
    message: Optional[str] = None
    is_resolved: bool = False
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    # AI prioritization
    priority: Optional[str] = None  # HIGH, MEDIUM, LOW
    priority_score: Optional[float] = None


class AlertResolve(BaseModel):
    resolution_note: Optional[str] = None


class AlertSummary(BaseModel):
    total: int = 0
    critical: int = 0
    warning: int = 0
    resolved: int = 0
    unresolved: int = 0
    by_institution: List[Dict] = []
