"""
Pydantic Schemas — KPI
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class KPIValue(BaseModel):
    """Single KPI data point."""
    institution_id: int
    institution_name: str
    institution_code: str
    metric_id: int
    metric_code: str
    metric_name: str
    unit: Optional[str] = None
    domain_code: str
    domain_name: str
    color_hex: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[int] = None
    value: float
    value_previous: Optional[float] = None
    delta_pct: Optional[float] = None
    higher_is_better: bool = True
    status: str = "normal"  # normal, warning, critical


class KPIDepartmentValue(KPIValue):
    """KPI at department level."""
    department_id: int
    department_code: str
    department_name: str
    specialty: Optional[str] = None


class KPITrend(BaseModel):
    """KPI values over time for trend analysis."""
    metric_code: str
    metric_name: str
    institution_id: int
    institution_name: str
    data_points: List[Dict[str, Any]]  # [{academic_year, semester, value}]


class KPIComparison(BaseModel):
    """Cross-institution comparison for a single metric."""
    metric_code: str
    metric_name: str
    unit: Optional[str] = None
    institutions: List[Dict[str, Any]]  # [{institution_code, name, value, status}]
    average: float
    min_value: float
    max_value: float


class DomainAverage(BaseModel):
    """Domain-level aggregated averages."""
    domain_code: str
    domain_name: str
    color_hex: Optional[str] = None
    academic_year: str
    semester: int
    institution_count: int
    avg_value: float
    min_value: float
    max_value: float
    stddev_value: Optional[float] = None


class DepartmentRanking(BaseModel):
    """Department ranking within an institution."""
    institution_name: str
    department_specialty: str
    metric_code: str
    metric_name: str
    unit: Optional[str] = None
    academic_year: str
    semester: int
    value: float
    rank_within_institution: int


class KPIDashboardResponse(BaseModel):
    """Full dashboard payload for the frontend."""
    kpis: List[KPIValue]
    alerts_summary: Dict[str, int] = {}  # {critical: N, warning: M}
    total_institutions: int = 0
    last_updated: Optional[datetime] = None
