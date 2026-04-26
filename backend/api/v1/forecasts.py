"""
API v1 — Forecasts (Read-only)
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.forecast import ForecastResponse

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])


@router.get("", response_model=list[ForecastResponse])
async def list_forecasts(
    institution_id: Optional[int] = Query(None),
    metric_id: Optional[int] = Query(None),
    target_year: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """List KPI forecasts with optional filters."""
    query = db.table("kpi_forecasts").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if metric_id:
        query = query.eq("metric_id", metric_id)
    if target_year:
        query = query.eq("target_year", target_year)
    query = query.order("target_year")
    
    response = await query.execute()
    return response.data


@router.get("/{forecast_id}", response_model=ForecastResponse)
async def get_forecast(forecast_id: int, db: AsyncClient = Depends(get_db)):
    """Get a specific forecast by ID."""
    response = await db.table("kpi_forecasts").select("*").eq("id", forecast_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return response.data[0]
