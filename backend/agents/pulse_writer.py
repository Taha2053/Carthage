"""
🤖 AI Agent: Pulse Writer
Generates concise institutional briefings in French.

STATUS: STUB — Teammate implements the OpenAI call.
BACKEND CALLS: services/kpi_engine.py, api/v1/reports.py
"""
from __future__ import annotations
import json
import logging
from typing import Dict

logger = logging.getLogger(__name__)


def generate_pulse(institution_name: str, kpis: dict) -> str:
    """
    Generate a concise briefing for an institution president.

    Args:
        institution_name: e.g. "ENSTAB"
        kpis: dict of KPI values, e.g. {"ACAD_SUCCESS_RATE": 72.5, "ACAD_DROPOUT_RATE": 18.3}

    Returns:
        A 3-sentence French briefing. Factual, direct, actionable.

    Example output:
        "L'ENSTAB affiche un taux de réussite de 72.5%, en baisse de 3% par rapport
         au semestre précédent. Le taux d'abandon atteint 18.3%, dépassant le seuil
         critique de 15%. Action recommandée : renforcer l'accompagnement pédagogique
         en S2."

    Implementation notes for teammate:
        system = "Tu es un analyste universitaire expert.
                  Tu génères des briefings concis en français pour les directeurs
                  d'établissements universitaires tunisiens.
                  Format: 3 phrases maximum. Ton: factuel, direct, actionnable.
                  Mentionne les chiffres précis. Signale ce qui est préoccupant."

        user = f"Établissement: {institution_name}\\nKPIs: {json.dumps(kpis, ensure_ascii=False)}"
        # → OpenAI call → return text
    """
    # STUB: return placeholder until teammate implements
    logger.info(f"[STUB] generate_pulse called for {institution_name}")
    return (
        f"[Agent non configuré] Briefing pour {institution_name}: "
        f"{len(kpis)} KPIs reçus. Implémentation en attente."
    )
