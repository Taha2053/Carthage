"""
🤖 AI Agent: Analyst (Excel → KPI Mapper)
Uses AI to auto-detect which Excel columns map to which KPIs.

STATUS: STUB — Teammate implements the OpenAI call.
BACKEND CALLS: services/ingestion.py
"""
from __future__ import annotations
import logging
from typing import Dict, List

import pandas as pd

logger = logging.getLogger(__name__)


def extract_from_file(df: pd.DataFrame, institution_id: str) -> list[dict]:
    """
    AI-powered Excel column → KPI mapping.

    Args:
        df: pandas DataFrame from uploaded Excel
        institution_id: target institution

    Returns:
        List of structured dicts ready for DB insert:
        [
            {"metric_code": "ACAD_SUCCESS_RATE", "value": 78.5, "academic_year": "2024-2025", "semester": 1},
            ...
        ]

    Implementation notes for teammate:
        Send column names + first 3 rows to AI
        AI identifies which column = which KPI
        Returns structured list ready for DB insert
    """
    logger.info(f"[STUB] extract_from_file called: {len(df)} rows, {list(df.columns)}")

    # STUB: return empty — teammate implements AI mapping
    return []
