"""
UCAR Intelligence Hub — Redis Cloud Event Bus
Provides pub/sub for the event-driven pipeline.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

import redis.asyncio as aioredis

from core.config import settings

logger = logging.getLogger(__name__)


class EventBus:
    """
    Simple Redis Cloud pub/sub event bus.
    
    Event types:
        - data_uploaded      → after Excel ingestion
        - kpi_updated        → after KPI recomputation
        - alert_triggered    → after threshold breach
        - report_generated   → after report creation
        - data_quality_check → after quality assessment
    """

    def __init__(self) -> None:
        self._redis: Optional[aioredis.Redis] = None
        self._pubsub: Optional[aioredis.client.PubSub] = None
        self._handlers: Dict[str, List[Callable]] = {}

    async def connect(self) -> None:
        """Connect to Redis Cloud."""
        try:
            self._redis = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
            )
            await self._redis.ping()
            logger.info("✅ Connected to Redis Cloud")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Using in-memory fallback.")
            self._redis = None

    async def disconnect(self) -> None:
        """Close Redis connection."""
        if self._pubsub:
            await self._pubsub.unsubscribe()
            await self._pubsub.close()
        if self._redis:
            await self._redis.close()
            logger.info("🔌 Redis disconnected")

    async def publish(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Publish an event to Redis.
        Falls back to direct handler invocation if Redis is unavailable.
        """
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        if self._redis:
            try:
                await self._redis.publish(f"ucar:{event_type}", json.dumps(event))
                logger.info(f"📤 Event published: {event_type}")
            except Exception as e:
                logger.error(f"❌ Redis publish failed: {e}")
                await self._invoke_handlers(event_type, event)
        else:
            # In-memory fallback
            await self._invoke_handlers(event_type, event)

    def subscribe(self, event_type: str, handler: Callable) -> None:
        """Register a handler for an event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
        logger.info(f"📥 Subscribed to: {event_type}")

    async def _invoke_handlers(self, event_type: str, event: Dict) -> None:
        """Invoke all registered handlers for an event type."""
        handlers = self._handlers.get(event_type, [])
        for handler in handlers:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"❌ Handler error for {event_type}: {e}")

    # ── Cache Helpers ────────────────────────────────────────
    async def cache_set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Cache a value in Redis with TTL (seconds)."""
        if self._redis:
            try:
                await self._redis.set(
                    f"ucar:cache:{key}",
                    json.dumps(value) if not isinstance(value, str) else value,
                    ex=ttl,
                )
            except Exception as e:
                logger.error(f"Cache set failed: {e}")

    async def cache_get(self, key: str) -> Optional[Any]:
        """Get a cached value from Redis."""
        if self._redis:
            try:
                val = await self._redis.get(f"ucar:cache:{key}")
                if val:
                    try:
                        return json.loads(val)
                    except json.JSONDecodeError:
                        return val
            except Exception as e:
                logger.error(f"Cache get failed: {e}")
        return None

    async def cache_delete(self, key: str) -> None:
        """Delete a cached value."""
        if self._redis:
            try:
                await self._redis.delete(f"ucar:cache:{key}")
            except Exception as e:
                logger.error(f"Cache delete failed: {e}")


# Singleton
event_bus = EventBus()
