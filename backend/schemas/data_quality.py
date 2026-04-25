"""
Pydantic Schemas — Data Quality
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DataQualityScore(BaseModel):
    """Quality score for an institution."""
    institution_id: int
    institution_name: str
    institution_code: str
    overall_score: float  # 0-100
    completeness: float
    consistency: float
    timeliness: float
    accuracy: float
    grade: str  # A, B, C, D, F


class DataQualityDetail(DataQualityScore):
    """Detailed breakdown with per-metric quality."""
    issues: List[Dict[str, Any]] = []
    suggestions: List[str] = []
    metrics_coverage: Dict[str, bool] = {}


class AnomalyDetection(BaseModel):
    """Detected anomaly in data."""
    institution_id: int
    institution_name: str
    metric_code: str
    metric_name: str
    value: float
    expected_range: str  # "65.0 - 85.0"
    deviation: float  # how many std devs away
    anomaly_type: str  # spike, drop, outlier
    explanation: Optional[str] = None  # AI-generated (teammate)
    suggestion: Optional[str] = None


class DataQualityReport(BaseModel):
    """Full data quality report across all institutions."""
    total_institutions: int
    average_score: float
    scores: List[DataQualityScore]
    anomalies: List[AnomalyDetection]
    top_issues: List[str]
