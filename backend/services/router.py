"""
Services — Router Agent
Classifies an incoming natural language query as either SQL or RAG.
"""
from __future__ import annotations

import logging
from core.llm import call_llm

logger = logging.getLogger(__name__)

_ROUTER_SYSTEM = (
    "You are a query router. Your ONLY job is to classify a question into one "
    "of two categories and respond with a SINGLE word: SQL or RAG.\n"
    "- SQL: questions about numbers, counts, rankings, trends, comparisons, KPIs, statistics\n"
    "- RAG: questions about explanations, summaries, policies, documents, context, definitions\n"
    "Never explain. Only output: SQL or RAG"
)


async def route_query(query: str) -> str:
    """
    Returns 'SQL' or 'RAG' based on the nature of the query.
    Falls back to 'RAG' on any error.
    """
    try:
        decision = await call_llm(
            prompt=f'Query: "{query}"',
            temperature=0.0,
            system=_ROUTER_SYSTEM,
        )
        decision = decision.strip().upper()
        logger.info(f"[Router] Query classified as: {decision}")
        if decision not in ("SQL", "RAG"):
            return "RAG"
        return decision
    except Exception as e:
        logger.warning(f"[Router] Classification failed ({e}), defaulting to RAG")
        return "RAG"
