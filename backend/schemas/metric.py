"""
Pydantic Schemas — Metric
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    domain_id: Optional[int] = None
    unit: Optional[str] = None
    aggregation: str = "AVG"
    formula: Optional[str] = None
    higher_is_better: bool = True
    warning_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None
    benchmark_national: Optional[float] = None
    description: Optional[str] = None
    source_table: Optional[str] = None
    is_computed: bool = False
    is_active: bool = True
