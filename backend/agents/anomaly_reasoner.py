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


def reason_anomaly(
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

    Implementation notes for teammate:
        Prompt: explain WHY this is anomalous, compare to peers, suggest action
        Use OpenAI with structured output (JSON mode)
    """
    logger.info(f"[STUB] reason_anomaly called: {institution}/{kpi_key}={value}")
    return {
        "title": f"Anomalie détectée: {kpi_key} à {institution}",
        "explanation": f"Valeur {value} dépasse le seuil {threshold} (moyenne pairs: {peer_avg})",
        "suggestion": "Agent AI non configuré — analyse en attente.",
        "severity": "critical" if value > threshold * 1.5 else "warning",
    }
