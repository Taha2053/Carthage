"""
API v1 — Alerts
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from schemas.alert import AlertResolve
from services.alert_engine import alert_engine

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("")
async def list_alerts(
    institution_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None),
    resolved: Optional[bool] = Query(False),
    limit: int = Query(100, le=500),
    db: AsyncSession = Depends(get_db),
):
    """All active alerts sorted by AI priority score."""
    return await alert_engine.get_alerts(db, institution_id, severity, resolved, limit)


@router.get("/institution/{institution_id}")
async def alerts_by_institution(
    institution_id: int, db: AsyncSession = Depends(get_db)
):
    """Alerts for one institution."""
    return await alert_engine.get_alerts(db, institution_id=institution_id)


@router.get("/critical")
async def critical_alerts(db: AsyncSession = Depends(get_db)):
    """Only critical unresolved alerts."""
    return await alert_engine.get_alerts(db, severity="critical", resolved=False)


@router.get("/summary")
async def alert_summary(db: AsyncSession = Depends(get_db)):
    """Alert summary by severity and institution."""
    return await alert_engine.get_summary(db)


@router.patch("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    body: AlertResolve = None,
    db: AsyncSession = Depends(get_db),
):
    """Mark an alert as resolved."""
    success = await alert_engine.resolve_alert(db, alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "resolved", "alert_id": alert_id}


@router.post("/generate")
async def trigger_alert_generation(db: AsyncSession = Depends(get_db)):
    """Manually trigger alert generation."""
    count = await alert_engine.generate_alerts(db)
    return {"status": "generated", "unresolved_count": count}
