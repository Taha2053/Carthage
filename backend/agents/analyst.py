"""
🤖 AI Agent: Analyst (Excel → KPI Mapper)
Uses AI to auto-detect which Excel columns map to which KPIs.

STATUS: STUB — Teammate implements the OpenAI call.
BACKEND CALLS: services/ingestion.py
"""
from __future__ import annotations
import logging
from typing import Dict, List

import pandas as pd

logger = logging.getLogger(__name__)


async def extract_from_file(data_text: str, filename: str, institution_id: str) -> dict:
    """
    AI-powered file text/data mapping.

    Args:
        data_text: Sample text from OCR or pandas DataFrame
        filename: Name of the file
        institution_id: target institution

    Returns:
        Structured dict with relevance score and DB ready facts:
        {
            "score": 85,
            "category": "HOT",
            "kpis": [
                {"metric_code": "ACAD_SUCCESS_RATE", "value": 78.5, "academic_year": "2024-2025", "semester": 1}
            ]
        }
    """
    from core.llm import call_llm
    import json
    
    logger.info(f"[Analyst] extract_from_file called for: {filename}")

    prompt = f"""
    You are an expert Data Lifecycle Manager for a university.
    A user just uploaded a file named '{filename}'.
    Here is a sample of the contents:
    {data_text[:2000]}  # Limit to avoid token overflow
    
    1. Determine if this data is highly relevant for University KPIs.
    2. Give it a relevance score from 0 to 100.
    3. Categorize it as HOT (Numerical KPIs for DB Insert), WARM (Qualitative Text for RAG Chat), or COLD (Irrelevant/Archive).
    4. If HOT: Extract the numerical KPIs.
    5. If WARM: Do NOT extract KPIs. Instead, provide a short 1-2 sentence text 'summary' of what the document is about.
    
    Return ONLY valid JSON in this exact format. 
    If HOT:
    {{
      "score": 95,
      "category": "HOT",
      "reason": "Contains enrollment numbers",
      "summary": "",
      "kpis": [
        {{"metric_code": "ACAD_SUCCESS_RATE", "value": 78.5, "academic_year": "2024-2025", "semester": 1}}
      ]
    }}
    If WARM (Text document with no numbers):
    {{
      "score": 60,
      "category": "WARM",
      "reason": "Text document about guidelines",
      "summary": "Ce document contient les consignes de rédaction pour les rapports de stage...",
      "kpis": []
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
        logger.info(f"[Analyst] File {filename} scored {decision.get('score')} ({decision.get('category')})")
        return decision
    except Exception as e:
        logger.error(f"[Analyst] Failed to process {filename}: {e}")
        return {"score": 0, "category": "COLD", "reason": "Failed to parse", "kpis": []}
