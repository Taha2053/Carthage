"""
Pydantic Schemas — Alert
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class AlertCreate(BaseModel):
    institution_id: int
    department_id: Optional[int] = None
    metric_id: int
    severity: str
    alert_type: str = "threshold"
    value: Optional[float] = None
    threshold: Optional[float] = None
    delta_pct: Optional[float] = None
    message: Optional[str] = None
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None


class AlertUpdate(BaseModel):
    severity: Optional[str] = None
    message: Optional[str] = None
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    is_resolved: Optional[bool] = None
    resolved_by: Optional[str] = None
    resolution_note: Optional[str] = None


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
    alert_type: str = "threshold"
    value: Optional[float] = None
    threshold: Optional[float] = None
    delta_pct: Optional[float] = None
    message: Optional[str] = None
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    is_resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_note: Optional[str] = None
    created_at: Optional[datetime] = None
    # AI prioritization
    priority: Optional[str] = None  # HIGH, MEDIUM, LOW
    priority_score: Optional[float] = None


class AlertResolve(BaseModel):
    resolved_by: Optional[str] = None
    resolution_note: Optional[str] = None


class AlertSummary(BaseModel):
    total: int = 0
    critical: int = 0
    warning: int = 0
    resolved: int = 0
    unresolved: int = 0
    by_institution: List[Dict] = []
