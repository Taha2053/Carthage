"""
UCAR Intelligence Hub — Event Processor Worker
Listens to events and triggers processing pipeline.
"""
from __future__ import annotations
import logging
from typing import Dict
from core.events import event_bus
from api.v1.websocket import manager

logger = logging.getLogger(__name__)


async def on_data_uploaded(event: Dict) -> None:
    """Handle data_uploaded event → push to WebSocket clients."""
    logger.info(f"📥 Worker: data_uploaded event received")
    await manager.broadcast("kpis", {
        "type": "data_uploaded",
        "data": event.get("data", {}),
    })


async def on_kpi_updated(event: Dict) -> None:
    """Handle kpi_updated event → push to WebSocket clients."""
    logger.info(f"📊 Worker: kpi_updated event received")
    await manager.broadcast("kpis", {
        "type": "kpi_update",
        "data": event.get("data", {}),
    })


async def on_alert_triggered(event: Dict) -> None:
    """Handle alert_triggered event → auto-explain with AI → push to WebSocket clients."""
    from agents.anomaly_reasoner import reason_anomaly
    from core.database import get_supabase
    
    logger.info(f"🚨 Worker: alert_triggered event received")
    
    # Extract alert ID from the event data if available
    alert_id = event.get("data", {}).get("alert_id")
    
    if alert_id:
        try:
            db = await get_supabase()
            
            # Fetch the alert details
            alert_resp = await db.table("alerts").select("*, dim_institution(code), dim_metric(code)").eq("id", alert_id).execute()
            
            if alert_resp.data:
                alert = alert_resp.data[0]
                
                # Only explain if it hasn't been explained yet
                if not alert.get("explanation"):
                    institution_code = alert.get("dim_institution", {}).get("code", "Unknown")
                    metric_code = alert.get("dim_metric", {}).get("code", "Unknown")
                    value = float(alert.get("value") or 0)
                    threshold = float(alert.get("threshold") or 0)
                    
                    logger.info(f"🧠 Worker: Auto-triggering AI Anomaly Reasoner for Alert {alert_id}")
                    ai_explanation = await reason_anomaly(
                        institution=institution_code,
                        kpi_key=metric_code,
                        value=value,
                        threshold=threshold,
                        peer_avg=threshold * 0.9
                    )
                    
                    update_data = {
                        "explanation": ai_explanation.get("explanation", ""),
                        "recommended_action": ai_explanation.get("suggestion", ""),
                    }
                    
                    await db.table("alerts").update(update_data).eq("id", alert_id).execute()
                    
                    # Update the event data to broadcast the new explanation
                    event["data"]["explanation"] = update_data["explanation"]
                    event["data"]["recommended_action"] = update_data["recommended_action"]
                    
        except Exception as e:
            logger.error(f"❌ Worker: Failed to run auto-explainer: {e}")

    # Broadcast to frontend
    await manager.broadcast("alerts", {
        "type": "alert",
        "data": event.get("data", {}),
    })


def register_event_handlers() -> None:
    """Register all event handlers with the event bus."""
    event_bus.subscribe("data_uploaded", on_data_uploaded)
    event_bus.subscribe("kpi_updated", on_kpi_updated)
    event_bus.subscribe("alert_triggered", on_alert_triggered)
    logger.info("✅ Event handlers registered")
