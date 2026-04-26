"""
Pydantic Schemas — NL Query
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class NLQueryRequest(BaseModel):
    query: str  # e.g. "Show dropout rate for 2024 in all institutions"
    institution_id: Optional[int] = None


class NLQueryResponse(BaseModel):
    query: str
    answer: str
    data: Optional[List[Dict[str, Any]]] = None
    generated_sql: Optional[str] = None
    execution_ms: Optional[int] = None
    was_successful: bool = True
