"""
API v1 — NL Query (AI Assistant)
Calls teammate's agents for natural language queries.
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.nl_query_log import NLQueryLog
from schemas.query import NLQueryRequest, NLQueryResponse

router = APIRouter(prefix="/query", tags=["AI Query"])


@router.post("", response_model=NLQueryResponse)
async def nl_query(body: NLQueryRequest, db: AsyncSession = Depends(get_db)):
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
    log = NLQueryLog(
        raw_query=body.query,
        institution_id=body.institution_id,
        generated_sql=generated_sql,
        result_summary=answer,
        execution_ms=elapsed,
        was_successful=success,
    )
    db.add(log)
    await db.flush()

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
    db: AsyncSession = Depends(get_db),
):
    """Past NL queries."""
    result = await db.execute(
        select(NLQueryLog).order_by(NLQueryLog.created_at.desc()).limit(limit)
    )
    logs = result.scalars().all()
    return [
        {
            "id": l.id,
            "query": l.raw_query,
            "answer": l.result_summary,
            "execution_ms": l.execution_ms,
            "was_successful": l.was_successful,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]
