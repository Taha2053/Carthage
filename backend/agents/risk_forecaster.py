"""
🤖 AI Agent: Risk Forecaster
Predicts future KPI trends based on historical data.

STATUS: STUB — Teammate implements the OpenAI call.
BACKEND CALLS: services/kpi_engine.py
"""
from __future__ import annotations
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


def forecast_risk(
    institution: str,
    kpi_key: str,
    history: list[float],
) -> dict:
    """
    Forecast risk from historical KPI data.

    Args:
        institution: e.g. "ENSTAB"
        kpi_key: e.g. "ACAD_DROPOUT_RATE"
        history: list of 4-8 historical values, e.g. [8.2, 10.1, 12.5, 15.3, 18.7, 22.1]

    Returns:
        {
            "prediction_text": "Si la tendance actuelle se maintient...",
            "weeks_to_event": 6,
            "confidence": 0.75
        }

    Implementation notes for teammate:
        Prompt: given these N data points, what happens in 4-8 weeks?
        Use OpenAI with structured output
    """
    logger.info(f"[STUB] forecast_risk called: {institution}/{kpi_key}, {len(history)} points")

    # Simple linear trend as placeholder
    if len(history) >= 2:
        trend = history[-1] - history[-2]
        direction = "hausse" if trend > 0 else "baisse"
    else:
        trend = 0
        direction = "stable"

    return {
        "prediction_text": (
            f"[Stub] {kpi_key} à {institution} montre une tendance en {direction}. "
            f"Agent AI non configuré."
        ),
        "weeks_to_event": 8,
        "confidence": 0.5,
    }
