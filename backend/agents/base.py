"""
AI Agents — Base Types & Interface

Defines the common types that ALL agents use.
Your teammate implements the internals; you define the contract.
"""
from __future__ import annotations
from typing import Any, Dict, Optional
from pydantic import BaseModel


class AgentResponse(BaseModel):
    """Standard response from any AI agent."""
    success: bool = True
    content: str = ""
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None
