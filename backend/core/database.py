"""
UCAR Intelligence Hub — Supabase SDK Async Client
Replaces SQLAlchemy to avoid port 5432/6543 blocking issues.
"""

from __future__ import annotations

import logging
from supabase import create_async_client, AsyncClient
from core.config import settings

logger = logging.getLogger(__name__)

# We use the Service Role key since RLS might block anonymous queries.
if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
    logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment!")

# Note: We don't initialize the client at module level because create_async_client 
# might need an active event loop, but we can do it via a function.

_client: AsyncClient | None = None

async def get_supabase() -> AsyncClient:
    global _client
    if _client is None:
        _client = await create_async_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    return _client

# Keep get_db as an alias for get_supabase to minimize refactoring imports in some places, 
# but it will yield an AsyncClient instead of AsyncSession.
async def get_db() -> AsyncClient:
    client = await get_supabase()
    yield client
