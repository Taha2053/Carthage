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
    Tu es un analyste de donnǸes prǸdictif pour l'UniversitǸ de Carthage.
    Analyse les donnǸes historiques suivantes pour l'indicateur '{kpi_key}'   l'institution '{institution}'.
    Valeurs historiques (de la plus ancienne   la plus rǸcente): {history}
    
    Projette ce qui se passera dans l'annǸe   venir si cette tendance se maintient.
    
    Tu DOIS retourner UNIQUEMENT un objet JSON valide, sans aucun texte ou formatage Markdown autour, avec ce format exact :
    {{
        "prediction_text": "Une prǸdiction claire et professionnelle en franais sur ce qui se passera si la tendance continue. Recommande une action.",
        "weeks_to_event": 6,
        "confidence": 0.85
    }}
    """
    
    try:
        response = await call_llm(prompt, temperature=0.1)
        
        # Clean markdown if present
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:-3].strip()
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:-3].strip()
            
        decision = json.loads(cleaned)
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
