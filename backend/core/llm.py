"""
AI Core — LLM & Embedding helpers (Mistral AI backend)
Uses Mistral free tier: mistral-embed + mistral-small-latest
"""
from __future__ import annotations

import asyncio
import logging
from typing import List

from core.config import settings

logger = logging.getLogger(__name__)


# ── Mistral client (lazy init) ────────────────────────────────
_mistral_client = None


def get_mistral_client():
    global _mistral_client
    if _mistral_client is None:
        key = settings.MISTRAL_API_KEY
        if not key:
            raise ValueError(
                "MISTRAL_API_KEY is not set in .env — AI features are disabled."
            )
        from mistralai.client import Mistral
        _mistral_client = Mistral(api_key=key)
        logger.info("[LLM] Mistral client initialised")
    return _mistral_client


# ── LLM call ─────────────────────────────────────────────────
async def call_llm(
    prompt: str,
    model: str = "mistral-small-latest",
    temperature: float = 0.2,
    system: str = "You are a helpful assistant for the UCAR University Intelligence Hub.",
) -> str:
    """Single async chat completion via Mistral."""
    client = get_mistral_client()
    try:
        response = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.chat.complete(
                    model=model,
                    temperature=temperature,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                )
            ),
            timeout=30.0,
        )
        return response.choices[0].message.content or ""
    except asyncio.TimeoutError:
        raise RuntimeError("Mistral chat request timed out after 30s.")


# ── Embedding call ────────────────────────────────────────────
async def get_embedding(text: str, model: str = "mistral-embed") -> List[float]:
    """
    Generate a 1024-dim embedding vector via Mistral.
    NOTE: Supabase documents table must use vector(1024).
    """
    client = get_mistral_client()
    logger.debug(f"[LLM] Embedding {len(text)} chars...")
    try:
        response = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.embeddings.create(
                    model=model,
                    inputs=[text[:8000]],
                )
            ),
            timeout=25.0,
        )
        return response.data[0].embedding
    except asyncio.TimeoutError:
        raise RuntimeError("Mistral embedding request timed out after 25s.")


# ── Text chunker ──────────────────────────────────────────────
def chunk_text(text: str, size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks for embedding.
    overlap ensures context is not lost at chunk boundaries.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start += size - overlap
    return chunks
