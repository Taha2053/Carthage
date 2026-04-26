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


async def forecast_risk(
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
    """
    from core.llm import call_llm
    import json
    
    logger.info(f"[RiskForecaster] Forecasting {kpi_key} for {institution} with {len(history)} points")

    prompt = f"""
    You are a predictive data analyst for a university.
    Analyze the following historical data points for the KPI '{kpi_key}' at institution '{institution}'.
    Historical values (oldest to newest): {history}
    
    Project what will happen in the next 4 to 8 weeks if this trend continues.
    
    Return ONLY valid JSON in this exact format:
    {{
        "prediction_text": "A clear, professional prediction in French about what will happen if the trend continues.",
        "weeks_to_event": 6,  // Integer estimation of weeks until a critical threshold is hit (if applicable, else 0)
        "confidence": 0.85  // Float between 0.0 and 1.0 indicating your confidence in this trend
    }}
    """
    
    try:
        response = await call_llm(prompt, temperature=0.1)
        
        # Clean markdown if present
        if response.startswith("```json"):
            response = response[7:-3]
        elif response.startswith("```"):
            response = response[3:-3]
            
        decision = json.loads(response.strip())
        return decision
    except Exception as e:
        logger.error(f"[RiskForecaster] Failed to forecast risk: {e}")
        
        # Fallback logic
        if len(history) >= 2:
            trend = history[-1] - history[-2]
            direction = "hausse" if trend > 0 else "baisse"
        else:
            trend = 0
            direction = "stable"

        return {
            "prediction_text": (
                f"{kpi_key} à {institution} montre une tendance en {direction}."
            ),
            "weeks_to_event": 8,
            "confidence": 0.5,
        }
