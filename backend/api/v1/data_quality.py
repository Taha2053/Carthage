"""
API v1 — Data Quality
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from services.data_quality import data_quality_service

router = APIRouter(prefix="/data-quality", tags=["Data Quality"])


@router.get("/scores")
async def quality_scores(db: AsyncClient = Depends(get_db)):
    """Data quality scores per institution (0-100 with grade)."""
    return await data_quality_service.compute_institution_scores(db)


@router.get("/anomalies")
async def anomalies(
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """Detected anomalies using Z-score method."""
    return await data_quality_service.detect_anomalies(db, institution_id)


@router.get("/{institution_id}")
async def quality_detail(institution_id: int, db: AsyncClient = Depends(get_db)):
    """Detailed quality breakdown for one institution."""
    scores = await data_quality_service.compute_institution_scores(db)
    for s in scores:
        if s["institution_id"] == institution_id:
            return s
    return {"error": "Institution not found"}



