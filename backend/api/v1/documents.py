"""
API v1 — Documents (RAG Knowledge Base)
Upload and search documents that feed the RAG agent.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from supabase._async.client import AsyncClient

from core.database import get_db
from services.document_ingestion import ingest_document

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents (RAG)"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    institution_id: Optional[int] = Query(None),
    doc_type: str = Query("report", description="E.g. report, policy, regulation, thesis"),
    title: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """
    Upload a PDF or text document into the RAG knowledge base.
    The file is chunked, embedded via OpenAI, and stored in the `documents` table.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    allowed = (".pdf", ".txt", ".md", ".docx")
    if not any(file.filename.lower().endswith(ext) for ext in allowed):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed)}",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = await ingest_document(
            db=db,
            content=content,
            filename=file.filename,
            institution_id=institution_id,
            doc_type=doc_type,
            source="upload",
            title=title,
        )
        return {"status": "success", **result}
    except Exception as e:
        logger.error(f"[Documents] Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_documents(
    institution_id: Optional[int] = Query(None),
    doc_type: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: AsyncClient = Depends(get_db),
):
    """List all documents in the knowledge base."""
    query = db.table("documents").select("id, title, source, doc_type, institution_id, created_at")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if doc_type:
        query = query.eq("doc_type", doc_type)
    query = query.order("created_at", desc=True).limit(limit)
    result = await query.execute()
    return result.data


@router.get("/{document_id}")
async def get_document(document_id: int, db: AsyncClient = Depends(get_db)):
    """Get a single document by ID."""
    result = await db.table("documents").select("id, title, content, source, doc_type, institution_id, metadata, created_at").eq("id", document_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return result.data[0]


@router.delete("/{document_id}")
async def delete_document(document_id: int, db: AsyncClient = Depends(get_db)):
    """Remove a document from the knowledge base."""
    result = await db.table("documents").delete().eq("id", document_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "deleted", "id": document_id}
