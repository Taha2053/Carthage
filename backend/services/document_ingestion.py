"""
Services — Document Ingestion Pipeline
Extracts text from PDF/TXT files, chunks it, embeds each chunk,
and stores everything in the `documents` table for RAG retrieval.
"""
from __future__ import annotations

import io
import logging
from typing import Any, Dict, List, Optional

from supabase._async.client import AsyncClient

from core.llm import chunk_text, get_embedding

logger = logging.getLogger(__name__)


def _extract_text_from_pdf(content: bytes) -> str:
    """Extract raw text from a PDF file using pypdf."""
    try:
        import pypdf  # type: ignore

        reader = pypdf.PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(pages)
    except ImportError:
        raise ImportError(
            "pypdf is required for PDF ingestion. "
            "Install it with: uv add pypdf"
        )


def _extract_text(content: bytes, filename: str) -> str:
    """Route to the correct extractor based on file extension."""
    fname = filename.lower()
    if fname.endswith(".pdf"):
        return _extract_text_from_pdf(content)
    elif fname.endswith(".txt") or fname.endswith(".md"):
        return content.decode("utf-8", errors="ignore")
    else:
        # Try plain text as fallback
        return content.decode("utf-8", errors="ignore")


async def ingest_document(
    db: AsyncClient,
    content: bytes,
    filename: str,
    institution_id: Optional[int] = None,
    doc_type: str = "report",
    source: str = "upload",
    title: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Full document ingestion pipeline:
    1. Extract text from file
    2. Chunk the text into overlapping segments
    3. Embed each chunk via OpenAI
    4. Insert all chunks into the `documents` table
    """
    text = _extract_text(content, filename)

    if not text.strip():
        return {"chunks_inserted": 0, "warning": "No text could be extracted from the file."}

    chunks = chunk_text(text, size=500, overlap=50)
    doc_title = title or filename.replace("_", " ").replace("-", " ")

    inserted = 0
    errors = 0

    for i, chunk in enumerate(chunks):
        if not chunk.strip():
            continue
        try:
            embedding = await get_embedding(chunk)
            await db.table("documents").insert(
                {
                    "title": f"{doc_title} (part {i + 1})",
                    "content": chunk,
                    "institution_id": institution_id,
                    "source": source,
                    "doc_type": doc_type,
                    "embedding": embedding,
                    "metadata": {"chunk_index": i, "total_chunks": len(chunks), "filename": filename},
                }
            ).execute()
            inserted += 1
        except Exception as e:
            logger.error(f"[Ingest] Failed to insert chunk {i}: {e}")
            errors += 1

    logger.info(f"[Ingest] {filename}: {inserted} chunks inserted, {errors} errors")

    return {
        "filename": filename,
        "total_chunks": len(chunks),
        "chunks_inserted": inserted,
        "errors": errors,
        "institution_id": institution_id,
    }
