"""
Pydantic Schemas — Upload
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class UploadResponse(BaseModel):
    upload_id: int = 0
    filename: str = ""
    institution_id: int = 0
    status: str = ""
    rows_parsed: int = 0
    rows_inserted: int = 0
    rows_failed: int = 0
    is_duplicate: bool = False
    data_quality_score: Optional[float] = None
    validation_errors: List[Dict[str, Any]] = []
    processing_ms: Optional[int] = None
    message: str = ""


class UploadValidationResult(BaseModel):
    is_valid: bool
    total_rows: int = 0
    valid_rows: int = 0
    invalid_rows: int = 0
    errors: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    detected_metrics: List[str] = []
    preview: List[Dict[str, Any]] = []