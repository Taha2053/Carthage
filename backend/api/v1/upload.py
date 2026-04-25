"""
API v1 — Data Upload Endpoint
Handles file upload with OCR preview and ingestion pipeline.
"""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.upload import UploadResponse, UploadValidationResult
from services.ingestion import ingestion_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    institution_id: int = Query(...),
    domain_code: str = Query("STU"),
    db: AsyncClient = Depends(get_db),
):
    """
    Upload and ingest KPI data file (CSV/Excel).
    """
    content = await file.read()
    filename = file.filename or "unknown"
    
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Check file type
    allowed_extensions = [".xlsx", ".xls", ".csv"]
    if not any(filename.endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {allowed_extensions}")
    
    # Verify institution exists
    inst_check = await db.table("dim_institution").select("id").eq("id", institution_id).execute()
    if not inst_check.data:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    try:
        result = await ingestion_service.ingest(
            db=db,
            file_content=content,
            filename=filename,
            institution_id=institution_id,
            domain_code=domain_code,
            uploaded_by="api",
        )
        
        return UploadResponse(
            upload_id=result.get("id", 0),
            filename=filename,
            institution_id=institution_id,
            status=result.get("status", "completed"),
            rows_parsed=result.get("rows_parsed", 0),
            rows_inserted=result.get("rows_inserted", 0),
            rows_failed=result.get("rows_failed", 0),
            is_duplicate=result.get("is_duplicate", False),
            data_quality_score=result.get("data_quality_score"),
            message=result.get("message", ""),
        )
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate", response_model=UploadValidationResult)
async def validate_file(
    file: UploadFile = File(...),
    db: AsyncClient = Depends(get_db),
):
    """
    Validate file without storing - returns preview and errors.
    """
    content = await file.read()
    filename = file.filename or "validate"
    
    try:
        df, col_mapping, warnings = await ingestion_service.parse_file(db, content, filename)
        valid_rows, invalid_rows, errors = await ingestion_service.validate_data(db, df, col_mapping)
        
        # Extract detected metrics
        detected_metrics = list(set(df[col_mapping.get("metric_code", "")].dropna().unique().tolist())) if "metric_code" in col_mapping else []
        
        return UploadValidationResult(
            is_valid=len(invalid_rows) == 0,
            total_rows=len(df),
            valid_rows=len(valid_rows),
            invalid_rows=len(invalid_rows),
            errors=errors[:20],
            warnings=warnings,
            detected_metrics=detected_metrics,
            preview=valid_rows[:10],
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history")
async def upload_history(
    institution_id: Optional[int] = Query(None),
    limit: int = Query(20, le=100),
    db: AsyncClient = Depends(get_db),
):
    """Get upload history."""
    query = db.table("upload_log").select("*")
    
    if institution_id:
        query = query.eq("institution_id", institution_id)
    
    result = await query.order("created_at", desc=True).limit(limit).execute()
    return result.data or []


@router.get("/history/{upload_id}")
async def upload_details(
    upload_id: int,
    db: AsyncClient = Depends(get_db),
):
    """Get upload details."""
    result = await db.table("upload_log").select("*").eq("id", upload_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return result.data[0]


@router.post("/extract")
async def extract_preview(
    file: UploadFile = File(...),
    db: AsyncClient = Depends(get_db),
):
    """
    Extract KPIs from file for preview (OCR simulation - AI agent comes later).
    """
    content = await file.read()
    filename = file.filename or "extract"
    
    try:
        df, col_mapping, warnings = await ingestion_service.parse_file(db, content, filename)
        preview = df.head(10).to_dict(orient="records")
        
        return {
            "preview": preview,
            "columns": list(df.columns),
            "col_mapping": col_mapping,
            "total_rows": len(df),
            "warnings": warnings,
            "ocr_note": "OCR extraction simulated - AI agent will process documents in production",
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))