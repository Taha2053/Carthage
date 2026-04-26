"""
UCAR Intelligence Hub — Application Configuration
Loads settings from .env using pydantic-settings.
"""

from __future__ import annotations

import json
import logging
import re
from typing import List
from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


def _to_pooler_url(direct_url: str) -> str:
    """
    Convert a Supabase direct database URL to the transaction-pooler URL.

    Direct:  postgresql+asyncpg://postgres:PASSWORD@db.PROJECTREF.supabase.co:5432/postgres
    Pooler:  postgresql+asyncpg://postgres.PROJECTREF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres

    The pooler hostname resolves to IPv4, avoiding the IPv6 DNS issue on Windows.
    The region defaults to 'us-east-1' and can be overridden via SUPABASE_DB_REGION env var.
    """
    # Match the Supabase direct URL pattern
    match = re.match(
        r"^(postgresql\+asyncpg)://(\w+):([^@]+)@db\.([a-z]+)\.supabase\.co:(\d+)/(.+)$",
        direct_url,
    )
    if not match:
        return direct_url

    scheme, user, password, project_ref, _port, dbname = match.groups()

    # Detect region from SUPABASE_DB_REGION env var, or default to us-east-1
    import os
    region = os.getenv("SUPABASE_DB_REGION", "us-east-1")

    pooler_url = (
        f"{scheme}://{user}.{project_ref}:{password}"
        f"@aws-0-{region}.pooler.supabase.com:6543/{dbname}"
    )
    logger.info(
        f"Auto-converted Supabase direct URL to pooler URL "
        f"(region={region}, project={project_ref})"
    )
    return pooler_url


class Settings(BaseSettings):
    """
    Central configuration. Values come from .env or environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────
    APP_NAME: str = "UCAR Intelligence Hub"
    APP_VERSION: str = "1.0.0"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    APP_NAME: str = "CARTHAGE"
    DEBUG: bool = False

    # ── Database (Supabase PostgreSQL) ───────────────────────
    DATABASE_URL: str = ""

    # ── Redis Cloud ──────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── Supabase Auth ────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # ── Supabase DB Region (for auto-pooler conversion) ──────
    SUPABASE_DB_REGION: str = "us-east-1"

    # ── AI (Mistral free tier) ────────────────────────────────
    MISTRAL_API_KEY: str = ""
    # Keep OpenAI key field for backward compat (unused now)
    OPENAI_API_KEY: str = ""

    # ── CORS ─────────────────────────────────────────────────
    CORS_ORIGINS: str = '["http://localhost:4200","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse the JSON array string into a list."""
        try:
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:4200", "http://localhost:3000"]

    @property
    def effective_database_url(self) -> str:
        """
        Returns the database URL to use, auto-converting Supabase direct
        URLs to transaction pooler URLs to avoid IPv6 DNS issues.
        """
        url = self.DATABASE_URL
        if not url:
            raise ValueError(
                "DATABASE_URL is not set. Please set it in your .env file."
            )
        # Auto-convert if it's a Supabase direct URL
        if "db." in url and ".supabase.co" in url:
            return _to_pooler_url(url)
        return url


# Singleton
settings = Settings()  # type: ignore[call-arg]
