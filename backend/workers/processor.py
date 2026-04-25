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
    """Handle alert_triggered event → push to WebSocket clients."""
    logger.info(f"🚨 Worker: alert_triggered event received")
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
