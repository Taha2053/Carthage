"""
API v1 — Alerts CRUD
"""

from __future__ import annotations

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient

from core.database import get_db
from schemas.alert import AlertCreate, AlertResponse, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=list[AlertResponse])
async def list_alerts(
    institution_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None),
    is_resolved: Optional[bool] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    query = db.table("alerts").select("*")
    if institution_id is not None:
        query = query.eq("institution_id", institution_id)
    if severity:
        query = query.eq("severity", severity)
    if is_resolved is not None:
        query = query.eq("is_resolved", is_resolved)
    query = query.order("created_at", desc=True)
    
    response = await query.execute()
    return response.data


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: int, db: AsyncClient = Depends(get_db)):
    response = await db.table("alerts").select("*").eq("id", alert_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Alert not found")
    return response.data[0]


@router.post("", response_model=AlertResponse, status_code=201)
async def create_alert(data: AlertCreate, db: AsyncClient = Depends(get_db)):
    insert_data = data.model_dump(exclude_unset=True)
    insert_data["created_at"] = datetime.utcnow().isoformat()
    response = await db.table("alerts").insert(insert_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create alert")
    return response.data[0]


@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    data: AlertUpdate,
    db: AsyncClient = Depends(get_db),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_alert(alert_id, db)
        
    response = await db.table("alerts").update(update_data).eq("id", alert_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Alert not found")
    return response.data[0]


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: int,
    resolved_by: Optional[str] = Query(None, description="Name or ID of solver"),
    resolution_note: Optional[str] = Query(None, description="How was it resolved?"),
    db: AsyncClient = Depends(get_db),
):
    update_data = {
        "is_resolved": True,
        "resolved_at": datetime.utcnow().isoformat(),
        "resolved_by": resolved_by,
        "resolution_note": resolution_note
    }
    response = await db.table("alerts").update(update_data).eq("id", alert_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Alert not found")
    return response.data[0]


@router.post("/{alert_id}/explain")
async def explain_alert(alert_id: int, db: AsyncClient = Depends(get_db)):
    """Trigger the AI Anomaly Reasoner to explain this alert and suggest an action."""
    from agents.anomaly_reasoner import reason_anomaly
    
    # Fetch the alert and related institution/metric
    alert_resp = await db.table("alerts").select("*, dim_institution(code), dim_metric(code)").eq("id", alert_id).execute()
    
    if not alert_resp.data:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert = alert_resp.data[0]
    institution_code = alert.get("dim_institution", {}).get("code", "Unknown")
    metric_code = alert.get("dim_metric", {}).get("code", "Unknown")
    value = float(alert.get("value") or 0)
    threshold = float(alert.get("threshold") or 0)
    
    # Run the AI Reasoner
    ai_explanation = await reason_anomaly(
        institution=institution_code,
        kpi_key=metric_code,
        value=value,
        threshold=threshold,
        peer_avg=threshold * 0.9  # Simulated peer average for hackathon
    )
    
    # Update the alert in the database with the AI's explanation and suggestion
    update_data = {
        "explanation": ai_explanation.get("explanation", ""),
        "recommended_action": ai_explanation.get("suggestion", ""),
    }
    
    update_resp = await db.table("alerts").update(update_data).eq("id", alert_id).execute()
    
    if not update_resp.data:
        raise HTTPException(status_code=500, detail="Failed to update alert with AI explanation")
        
    return update_resp.data[0]
