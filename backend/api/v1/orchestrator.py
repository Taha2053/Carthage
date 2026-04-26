"""
API v1 — Orchestrator Endpoints
Exposes the AgentOrchestrator pipelines as REST endpoints.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from core.database import get_db
from agents.orchestrator import orchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])


@router.post("/analyse")
async def deep_analysis(
    institution_id: int = Query(..., description="Institution to analyse"),
    include_report: bool = Query(False, description="Set true to also generate a full narrative report"),
    db=Depends(get_db),
):
    """
    Run a full AI-native deep analysis on a single institution.
    
    The Orchestrator will:
    1. Fetch the institution's current KPI state and alerts.
    2. Ask Mistral AI which agents are needed.
    3. Run only the relevant agents (Pulse Writer, Anomaly Reasoner, Risk Forecaster, Report Writer).
    4. Return a unified payload with all results.
    """
    try:
        result = await orchestrator.run_deep_analysis(
            institution_id=institution_id,
            db=db,
            include_report=include_report,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"[OrchestratorAPI] Deep analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {e}")


@router.post("/network-brief")
async def network_brief(db=Depends(get_db)):
    """
    Generate a cross-institution executive briefing for the Carthage University President.
    
    The Orchestrator will:
    1. Fetch KPIs for every institution in the network.
    2. Run Pulse Writer for each institution.
    3. Ask Mistral AI to synthesize a cross-network executive summary in French.
    4. Return individual institution pulses + the unified network summary.
    """
    try:
        result = await orchestrator.run_network_brief(db=db)
        return result
    except Exception as e:
        logger.error(f"[OrchestratorAPI] Network brief failed: {e}")
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {e}")


@router.post("/upload-pipeline")
async def trigger_upload_pipeline(
    institution_id: int = Query(...),
    filename: str = Query(...),
    rows_inserted: int = Query(0),
    db=Depends(get_db),
):
    """
    Manually trigger the post-upload intelligence pipeline for testing.
    In production this is triggered automatically by the Redis event bus.
    """
    try:
        result = await orchestrator.run_post_upload_pipeline(
            institution_id=institution_id,
            uploaded_data={"filename": filename, "rows_inserted": rows_inserted},
            db=db,
        )
        return result
    except Exception as e:
        logger.error(f"[OrchestratorAPI] Upload pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {e}")
