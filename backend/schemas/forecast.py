"""
Pydantic Schemas — Forecast & Benchmark
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ForecastResponse(BaseModel):
    """Read-only response for kpi_forecasts."""
    id: int
    institution_id: int
    department_id: Optional[int] = None
    metric_id: int
    forecast_date: date
    predicted_value: float
    confidence_low: Optional[float] = None
    confidence_high: Optional[float] = None
    confidence_level: float = 0.95
    model_name: Optional[str] = None
    horizon_days: Optional[int] = None
    mape: Optional[float] = None
    based_on_periods: Optional[int] = None
    generated_at: Optional[datetime] = None


class BenchmarkResponse(BaseModel):
    """Read-only response for institutional_benchmarks."""
    id: int
    metric_id: int
    academic_year: Optional[str] = None
    scope: Optional[str] = None
    benchmark_value: float
    percentile_10: Optional[float] = None
    percentile_25: Optional[float] = None
    percentile_50: Optional[float] = None
    percentile_75: Optional[float] = None
    percentile_90: Optional[float] = None
    sample_size: Optional[int] = None
    source: Optional[str] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
