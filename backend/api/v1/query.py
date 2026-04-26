"""
API v1 — NL Query (Hybrid AI: SQL Agent + RAG Agent)
Router classifies query → dispatches to SQL or RAG agent → logs result.
"""
from __future__ import annotations

import logging
import time
from typing import Optional

from fastapi import APIRouter, Depends, Query
from supabase._async.client import AsyncClient

from core.database import get_db
from schemas.query import NLQueryRequest, NLQueryResponse
from services.router import route_query
from services.sql_agent import sql_agent
from services.rag_agent import rag_agent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/query", tags=["AI Query"])


@router.post("", response_model=NLQueryResponse, response_model_exclude_none=True)
async def nl_query(body: NLQueryRequest, db: AsyncClient = Depends(get_db)):
    """
    Hybrid NL query endpoint.
    - Routes numeric/KPI questions → SQL Agent (NL→SQL→Execute)
    - Routes explanatory questions → RAG Agent (Embed→Retrieve→LLM)
    """
    start = time.time()
    answer = f"[AI Agent not configured] Received: '{body.query}'"
    generated_sql = None
    data = None
    success = False
    query_type = "unknown"

    try:
        # 1. Router decides which agent to use
        decision = await route_query(body.query)
        query_type = decision

        if decision == "SQL":
            # 2a. NL → SQL Agent
            result = await sql_agent(body.query, db, institution_id=body.institution_id)
            answer = result.get("answer", "")
            generated_sql = result.get("sql")
            data = result.get("raw_data", [])
            error = result.get("error")
            success = not bool(error)

        else:
            # 2b. RAG Agent
            result = await rag_agent(body.query, db, institution_id=body.institution_id)
            answer = result.get("answer", "")
            data = result.get("sources", [])
            success = bool(answer)

    except Exception as e:
        logger.error(f"[Query] Unhandled error: {e}")
        answer = f"An error occurred while processing your query: {str(e)}"

    elapsed = int((time.time() - start) * 1000)

    # 3. Log every query for history and analytics
    try:
        await db.table("nl_query_log").insert({
            "raw_query": body.query,
            "institution_id": body.institution_id,
            "generated_sql": generated_sql,
            "result_summary": answer[:500],
            "execution_ms": elapsed,
            "was_successful": success,
        }).execute()
    except Exception as log_err:
        logger.warning(f"[Query] Failed to log query: {log_err}")

    return NLQueryResponse(
        query=body.query,
        answer=answer,
        data=data,
        execution_ms=elapsed,
        was_successful=success,
    )


@router.get("/history")
async def query_history(
    limit: int = Query(20, le=100),
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Past NL queries with filters."""
    query = db.table("nl_query_log").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    resp = await query.order("created_at", desc=True).limit(limit).execute()

    return [
        {
            "id": l.get("id"),
            "query": l.get("raw_query"),
            "answer": l.get("result_summary"),
            "execution_ms": l.get("execution_ms"),
            "was_successful": l.get("was_successful"),
            "created_at": l.get("created_at"),
        }
        for l in resp.data
    ]
