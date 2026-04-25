"""
🤖 AI Agent: Report Writer
Generates full narrative reports in French.

STATUS: STUB — Teammate implements the OpenAI call.
BACKEND CALLS: api/v1/reports.py
"""
from __future__ import annotations
import logging
from typing import Dict

logger = logging.getLogger(__name__)


def write_report(
    institution: str,
    period: str,
    all_kpis: dict,
) -> str:
    """
    Generate a full narrative report in French.

    Args:
        institution: e.g. "ENSTAB"
        period: e.g. "2024-09-01 to 2025-03-01"
        all_kpis: dict of all KPIs for the institution

    Returns:
        Full report narrative in French.
        Structure: intro → academic → finance → HR → conclusion + recommendations

    Implementation notes for teammate:
        Use OpenAI with a long-form prompt
        Structure the output with clear sections
        Include specific numbers from all_kpis
    """
    logger.info(f"[STUB] write_report called: {institution}, {period}")

    return (
        f"# Rapport — {institution}\n\n"
        f"**Période:** {period}\n\n"
        f"## Résumé\n\n"
        f"Agent AI non configuré. {len(all_kpis)} indicateurs reçus.\n\n"
        f"## Recommandations\n\n"
        f"En attente de l'implémentation de l'agent de rédaction.\n"
    )
