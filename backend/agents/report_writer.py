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


async def write_report(
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
    """
    from core.llm import call_llm
    import json
    
    logger.info(f"[ReportWriter] Generating report for {institution}, period: {period}")

    system_prompt = (
        "Tu es un consultant expert en gestion de l'enseignement supérieur. "
        "Ton rôle est de rédiger des rapports institutionnels complets et professionnels en français. "
        "Le rapport doit être bien structuré avec des titres Markdown (##)."
    )

    user_prompt = f"""
    Établissement: {institution}
    Période: {period}
    Données des KPIs:
    {json.dumps(all_kpis, indent=2, ensure_ascii=False)}

    Rédige un rapport narratif complet structuré comme suit :
    1. Introduction (Contexte général)
    2. Performance Académique (Analyse des taux de réussite, abandons, etc.)
    3. Performance Financière (Analyse des budgets)
    4. Ressources Humaines & Infrastructures
    5. Conclusion et Recommandations (Actions claires basées sur les chiffres)

    Assure-toi d'inclure les chiffres exacts fournis dans les KPIs. Le ton doit être formel et analytique.
    """

    try:
        response = await call_llm(user_prompt, system=system_prompt, temperature=0.3)
        return response.strip()
    except Exception as e:
        logger.error(f"[ReportWriter] Failed to generate report: {e}")
        return (
            f"# Rapport — {institution}\n\n"
            f"**Période:** {period}\n\n"
            f"## Erreur de génération\n\n"
            f"Une erreur est survenue lors de la communication avec l'IA."
        )
