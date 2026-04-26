"""
🤖 AI Agent: Anomaly Reasoner
Explains WHY a KPI value is anomalous, compares to peers, suggests action.

STATUS: STUB — Teammate implements the OpenAI call.
BACKEND CALLS: services/data_quality.py, services/alert_engine.py
"""
from __future__ import annotations
import logging
from typing import Dict

logger = logging.getLogger(__name__)


async def reason_anomaly(
    institution: str,
    kpi_key: str,
    value: float,
    threshold: float,
    peer_avg: float,
) -> dict:
    """
    Explain an anomaly with AI reasoning.

    Args:
        institution: e.g. "ENSTAB"
        kpi_key: e.g. "ACAD_DROPOUT_RATE"
        value: the anomalous value, e.g. 28.5
        threshold: the threshold that was breached, e.g. 20.0
        peer_avg: average across peer institutions, e.g. 12.3

    Returns:
        {
            "title": "Taux d'abandon critique à l'ENSTAB",
            "explanation": "Le taux d'abandon de 28.5% dépasse...",
            "suggestion": "Renforcer le suivi pédagogique...",
            "severity": "critical"
        }
    """
    from core.llm import call_llm
    import json
    
    logger.info(f"[AnomalyReasoner] Analyzing {kpi_key} for {institution}")

    prompt = f"""
    You are a university data intelligence AI.
    An anomaly was detected for institution '{institution}'.
    KPI: {kpi_key}
    Current Value: {value}
    Threshold Breached: {threshold}
    Average across peer institutions: {peer_avg}
    
    Explain WHY this is anomalous, compare it to peers, and suggest an actionable solution in French.
    Determine if severity is "warning" or "critical".
    
    Return ONLY valid JSON in this exact format:
    {{
        "title": "Short descriptive title in French",
        "explanation": "Clear explanation of the anomaly in French",
        "suggestion": "Actionable suggestion in French",
        "severity": "critical" 
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
        logger.error(f"[AnomalyReasoner] Failed to reason anomaly: {e}")
        return {
            "title": f"Anomalie détectée: {kpi_key} à {institution}",
            "explanation": f"Valeur {value} dépasse le seuil {threshold} (moyenne pairs: {peer_avg}). Raisonnement IA indisponible.",
            "suggestion": "Vérifier la validité des données saisies.",
            "severity": "critical" if value > threshold * 1.5 else "warning",
        }
