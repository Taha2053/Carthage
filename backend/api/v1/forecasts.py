"""
API v1 — Forecasts (Read-only)
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from schemas.forecast import ForecastResponse

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])


@router.get("", response_model=list[ForecastResponse])
async def list_forecasts(
    institution_id: Optional[int] = Query(None),
    metric_id: Optional[int] = Query(None),
    target_year: Optional[int] = Query(None),
    db=Depends(get_db),
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
    
    response = query.execute()
    return response.data


@router.get("/{forecast_id}", response_model=ForecastResponse)
async def get_forecast(forecast_id: int, db=Depends(get_db)):
    """Get a specific forecast by ID."""
    response = db.table("kpi_forecasts").select("*").eq("id", forecast_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return response.data[0]


@router.post("/generate/ai", response_model=ForecastResponse, status_code=201)
async def generate_ai_forecast(
    institution_id: int = Query(..., description="Institution ID"),
    metric_id: int = Query(..., description="Metric ID to forecast"),
    db=Depends(get_db)
):
    """Trigger the Risk Forecaster AI agent to predict future trends."""
    from agents.risk_forecaster import forecast_risk
    from datetime import datetime
    
    # 1. Fetch institution details
    inst_resp = db.table("dim_institution").select("name, code").eq("id", institution_id).execute()
    if not inst_resp.data:
        raise HTTPException(status_code=404, detail="Institution not found")
    institution_name = inst_resp.data[0]["name"]
    
    # 2. Fetch metric details
    metric_resp = db.table("dim_metric").select("code, name").eq("id", metric_id).execute()
    if not metric_resp.data:
        raise HTTPException(status_code=404, detail="Metric not found")
    metric_code = metric_resp.data[0]["code"]
    
    # 3. Fetch historical data points for this metric/institution
    history_resp = db.table("fact_kpis")\
        .select("value, dim_time(academic_year, semester)")\
        .eq("institution_id", institution_id)\
        .eq("metric_id", metric_id)\
        .execute()
        
    if not history_resp.data:
        raise HTTPException(status_code=400, detail="Not enough historical data to generate a forecast")
        
    # Sort history by academic year (rudimentary sort for the prompt)
    sorted_history = sorted(
        history_resp.data,
        key=lambda x: (x.get("dim_time", {}).get("academic_year", ""), x.get("dim_time", {}).get("semester", 0))
    )
    
    # Extract just the raw float values
    values = [row.get("value") for row in sorted_history if row.get("value") is not None]
    
    if len(values) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 historical data points to forecast")
        
    # 4. Call the AI Agent
    prediction = await forecast_risk(
        institution=institution_name,
        kpi_key=metric_code,
        history=values[-8:]  # pass up to last 8 data points
    )
    
    # 5. Save the forecast to the database
    current_year = datetime.now().year
    target_year = current_year + 1
    
    # Calculate a rough predicted_value based on the last value + trend if not returned by AI
    # Or we can just use the last value + arbitrary trend if the AI doesn't return an exact number
    # For now, we store the prediction text in the 'factors' array and confidence
    
    forecast_data = {
        "institution_id": institution_id,
        "metric_id": metric_id,
        "target_year": target_year,
        "predicted_value": values[-1],  # Placeholder until we make the AI return an exact float
        "confidence_lower": round(values[-1] * 0.9, 2),
        "confidence_upper": round(values[-1] * 1.1, 2),
        "factors": [{"insight": prediction.get("prediction_text", "")}],
        "model_used": "Mistral AI",
        "created_at": datetime.utcnow().isoformat()
    }
    
    insert_resp = db.table("kpi_forecasts").insert(forecast_data).execute()
    
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to save generated forecast")
        
    return insert_resp.data[0]
