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


async def generate_pulse(institution_name: str, kpis: dict) -> str:
    """
    Generate a concise briefing for an institution president.

    Args:
        institution_name: e.g. "ENSTAB"
        kpis: dict of KPI values, e.g. {"ACAD_SUCCESS_RATE": 72.5, "ACAD_DROPOUT_RATE": 18.3}

    Returns:
        A 3-sentence French briefing. Factual, direct, actionable.
    """
    from core.llm import call_llm

    logger.info(f"[PulseWriter] Generating pulse for {institution_name}")

    system_prompt = (
        "Tu es un analyste universitaire expert. "
        "Tu génères des briefings concis en français pour les directeurs "
        "d'établissements universitaires tunisiens. "
        "Format: 3 phrases maximum. Ton: factuel, direct, actionnable. "
        "Mentionne les chiffres précis. Signale ce qui est préoccupant."
    )

    user_prompt = f"Établissement: {institution_name}\nKPIs: {json.dumps(kpis, ensure_ascii=False)}"

    try:
        response = await call_llm(user_prompt, system=system_prompt, temperature=0.3)
        return response.strip()
    except Exception as e:
        logger.error(f"[PulseWriter] Failed to generate pulse: {e}")
        return f"Erreur lors de la génération du briefing pour {institution_name}."
