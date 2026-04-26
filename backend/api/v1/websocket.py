"""
API v1 — WebSocket for Real-Time Dashboard
"""
from __future__ import annotations
import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manages WebSocket connections with channel-based subscriptions."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "all": set(),
            "kpis": set(),
            "alerts": set(),
        }

    async def connect(self, websocket: WebSocket, channel: str = "all"):
        await websocket.accept()
        self.active_connections.setdefault(channel, set()).add(websocket)
        self.active_connections["all"].add(websocket)
        logger.info(f"🔌 WS connected to channel: {channel}")

    def disconnect(self, websocket: WebSocket):
        for channel in self.active_connections.values():
            channel.discard(websocket)

    async def broadcast(self, channel: str, message: dict):
        """Send message to all subscribers of a channel."""
        dead = []
        for conn in self.active_connections.get(channel, set()):
            try:
                await conn.send_json(message)
            except Exception:
                dead.append(conn)
        for d in dead:
            self.disconnect(d)

    async def broadcast_all(self, message: dict):
        """Send to all connected clients."""
        await self.broadcast("all", message)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.

    Client sends: {"action": "subscribe", "channel": "kpis"}
    Server pushes: {"type": "kpi_update", "data": {...}}
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")
                channel = msg.get("channel", "all")

                if action == "subscribe":
                    manager.active_connections.setdefault(channel, set()).add(websocket)
                    await websocket.send_json({
                        "type": "subscribed",
                        "channel": channel,
                    })
                elif action == "unsubscribe":
                    manager.active_connections.get(channel, set()).discard(websocket)
                    await websocket.send_json({
                        "type": "unsubscribed",
                        "channel": channel,
                    })
                elif action == "ping":
                    await websocket.send_json({"type": "pong"})
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("🔌 WS disconnected")
