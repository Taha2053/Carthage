"""
UCAR Intelligence Hub — Application Configuration
Loads settings from .env using pydantic-settings.
"""

from __future__ import annotations

import json
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


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
    DEBUG: bool = False

    # ── Database (Supabase PostgreSQL) ───────────────────────
    DATABASE_URL: str

    # ── Redis Cloud ──────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── Supabase Auth ────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # ── OpenAI (teammate's agents) ───────────────────────────
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


# Singleton
settings = Settings()  # type: ignore[call-arg]
