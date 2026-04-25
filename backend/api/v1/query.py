"""
API v1 — NL Query (AI Assistant)
Calls teammate's agents for natural language queries.
Refactored to use Supabase SDK instead of SQLAlchemy.
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.query import NLQueryRequest, NLQueryResponse

router = APIRouter(prefix="/query", tags=["AI Query"])


@router.post("", response_model=NLQueryResponse)
async def nl_query(body: NLQueryRequest, db: AsyncClient = Depends(get_db)):
    """Natural language query — powered by AI agent (teammate implements)."""
    import time
    start = time.time()

    # Placeholder: teammate's agent will fill this
    answer = f"[AI Agent not yet configured] Received query: '{body.query}'"
    generated_sql = None
    data = None
    success = False

    try:
        # Attempt to call teammate's agent
        from agents.analyst import extract_from_file
        # For NL queries, we'd use a different agent pattern
        # This is the integration point
        answer = "Agent integration point — teammate will implement NL→SQL logic"
    except Exception:
        pass

    elapsed = int((time.time() - start) * 1000)

    # Log the query
    insert_data = {
        "raw_query": body.query,
        "institution_id": body.institution_id,
        "generated_sql": generated_sql,
        "result_summary": answer,
        "execution_ms": elapsed,
        "was_successful": success,
    }
    
    await db.table("nl_query_log").insert(insert_data).execute()

    return NLQueryResponse(
        query=body.query,
        answer=answer,
        data=data,
        generated_sql=generated_sql,
        execution_ms=elapsed,
        was_successful=success,
    )


@router.get("/history")
async def query_history(
    limit: int = Query(20, le=100),
    db: AsyncClient = Depends(get_db),
):
    """Past NL queries."""
    resp = await db.table("nl_query_log").select("*").order("created_at", desc=True).limit(limit).execute()
    logs = resp.data
    return [
        {
            "id": l.get("id"),
            "query": l.get("raw_query"),
            "answer": l.get("result_summary"),
            "execution_ms": l.get("execution_ms"),
            "was_successful": l.get("was_successful"),
            "created_at": l.get("created_at"),
        }
        for l in logs
    ]
