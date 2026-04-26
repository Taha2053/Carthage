"""
UCAR Intelligence Hub — Main Application Entry Point

Run with: uv run uvicorn main:app --reload --port 8000
API docs: http://localhost:8000/docs
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

from core.config import settings
from core.events import event_bus
from api.router import api_router
from workers.processor import register_event_handlers

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(name)s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ucar")


# ── Lifespan ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown hooks."""
    # STARTUP
    logger.info("🚀 Starting UCAR Intelligence Hub...")

    # Connect Redis Cloud
    await event_bus.connect()

    # Register event handlers
    register_event_handlers()

    logger.info("✅ All systems ready")
    logger.info(f"📄 API docs: http://localhost:8000/docs")

    yield

    # SHUTDOWN
    logger.info("🔌 Shutting down...")
    await event_bus.disconnect()
    logger.info("👋 Goodbye")


# ── App ──────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "🎓 Intelligent university management platform for the University of Carthage.\n\n"
        "Real-time centralization of operational, academic, financial, and environmental data.\n"
        "Event-driven pipeline with instant KPI updates and smart alerts."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for local dev — restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ───────────────────────────────────────────────────
app.include_router(api_router)


# ── Root ─────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running",
    }


# ── RAG Chat UI ──────────────────────────────────────────────
@app.get("/rag", tags=["Tools"], include_in_schema=False)
async def rag_chat_ui():
    """Serve the RAG chat HTML interface."""
    html_path = os.path.join(os.path.dirname(__file__), "rag_chat.html")
    return FileResponse(html_path, media_type="text/html")
