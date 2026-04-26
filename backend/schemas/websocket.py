"""
Pydantic Schemas — WebSocket Events
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel


class WSSubscribe(BaseModel):
    action: str  # subscribe, unsubscribe
    channel: str  # kpis, alerts, all
    institution_id: Optional[int] = None


class WSEvent(BaseModel):
    type: str  # kpi_update, alert, data_uploaded, report_generated
    data: Dict[str, Any]
    timestamp: Optional[str] = None


class WSKPIUpdate(BaseModel):
    institution_id: int
    institution_code: str
    metric_code: str
    metric_name: str
    value: float
    previous_value: Optional[float] = None
    delta_pct: Optional[float] = None
    status: str = "normal"


class WSAlertNotification(BaseModel):
    alert_id: int
    institution_id: int
    institution_name: str
    metric_name: str
    severity: str
    value: float
    threshold: float
    message: str
    priority: Optional[str] = None
