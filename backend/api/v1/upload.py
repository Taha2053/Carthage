"""
API v1 — Data Upload Endpoint
Handles file upload with ingestion pipeline.
"""

from __future__ import annotations

import logging
import uuid
from typing import Optional
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, Form
from core.database import get_db, get_supabase
from core.config import settings
from schemas.upload import UploadResponse, UploadValidationResult
from services.ingestion import ingestion_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["Upload"])


async def upload_to_storage(db: AsyncClient, content: bytes, filename: str, institution_id: int, domain_code: str) -> str:
    """Upload file to Supabase Storage and return the path."""
    try:
        file_ext = filename.split('.')[-1].lower()
        unique_filename = f"{domain_code}/{institution_id}/{uuid.uuid4()}.{file_ext}"
        
        mime_type = _get_mime_type(filename)
        
        bucket = db.storage.from_('documents')
        
        logger.info(f"📤 Uploading to storage: {unique_filename} ({mime_type})")
        
        response = await bucket.upload(unique_filename, content, {
            "content_type": mime_type,
            "upsert": False,
        })
        
        logger.info(f"📤 Upload response: {response}")
        
        return unique_filename
    
    except Exception as e:
        logger.error(f"❌ Storage upload error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return ""


def _get_mime_type(filename: str) -> str:
    """Get MIME type from filename extension."""
    mime_types = {
        '.csv': 'text/csv',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel',
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
    }
    for ext, mime in mime_types.items():
        if filename.lower().endswith(ext):
            return mime
    return 'application/octet-stream'


@router.post("", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    institution_id: int = Form(...),
    domain_code: str = Form("STU"),
):
    """
    Upload and ingest KPI data file (CSV/Excel/PDF/Image/Doc).
    """
    content = await file.read()
    filename = file.filename or "unknown"
    
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Allowed file types (matching Supabase Storage)
    ALLOWED_EXTENSIONS = [
        ".csv",                           # text/csv
        ".xlsx",                          # application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        ".xls",                           # application/vnd.ms-excel
        ".pdf",                           # application/pdf
        ".png", ".jpg", ".jpeg", ".gif", ".webp",  # image/*
        ".docx",                          # application/vnd.openxmlformats-officedocument.wordprocessingml.document
        ".doc",                           # application/msword
    ]
    
    if not any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}"
        )
    
    db = await get_supabase()
    
    inst_check = db.table("dim_institution").select("id").eq("id", institution_id).execute()
    if not inst_check.data:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    # Upload file to Supabase Storage first
    storage_path = await upload_to_storage(db, content, filename, institution_id, domain_code)
    storage_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/documents/{storage_path}" if storage_path else ""
    
    try:
        result = await ingestion_service.ingest(
            db=db,
            file_content=content,
            filename=filename,
            institution_id=institution_id,
            domain_code=domain_code,
            uploaded_by="api",
            storage_path=storage_path,
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
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate", response_model=UploadValidationResult)
async def validate_file(
    file: UploadFile = File(...),
):
    """Validate file without storing."""
    content = await file.read()
    filename = file.filename or "validate"
    
    # Allowed file types
    ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".pdf", ".png", ".jpg", ".jpeg", ".docx", ".doc"]
    if not any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    db = await get_supabase()
    
    try:
        df, col_mapping, warnings = await ingestion_service.parse_file(db, content, filename)
        valid_rows, invalid_rows, errors = await ingestion_service.validate_data(db, df, col_mapping)
        
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
):
    """Get upload history."""
    db = await get_supabase()
    query = db.table("upload_log").select("*")
    
    if institution_id:
        query = query.eq("institution_id", institution_id)
    
    result = await query.order("created_at", desc=True).limit(limit).execute()
    return result.data or []


@router.get("/history/{upload_id}")
async def upload_details(upload_id: int):
    """Get upload details."""
    db = await get_supabase()
    result = db.table("upload_log").select("*").eq("id", upload_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return result.data[0]


@router.post("/extract")
async def extract_preview(
    file: UploadFile = File(...),
):
    """Extract KPIs preview using OCR and AI Analyst for Images/PDFs, or Pandas for CSV/Excel."""
    from services.ocr_service import ocr_service
    from agents.analyst import extract_from_file
    
    content = await file.read()
    filename = file.filename or "extract"
    filename_lower = filename.lower()
    
    # Allowed file types
    ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".pdf", ".png", ".jpg", ".jpeg", ".docx", ".doc"]
    if not any(filename_lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    try:
        # Route 1: Images & PDFs (OCR + AI Analyst)
        if filename_lower.endswith(('.pdf', '.png', '.jpg', '.jpeg')):
            logger.info(f"🔍 Routing {filename} to OCR Service")
            extracted_text = await ocr_service.extract_text(content, filename)
            
            if not extracted_text:
                raise ValueError("OCR failed to extract any text from the document.")
                
            logger.info(f"🧠 Sending OCR text to AI Analyst")
            ai_decision = await extract_from_file(data_text=extracted_text, filename=filename, institution_id="preview")
            
            return {
                "filename": filename,
                "relevance_score": ai_decision.get("score"),
                "category": ai_decision.get("category"),
                "summary": ai_decision.get("summary", ""),
                "extracted_kpis": ai_decision.get("kpis", []),
                "method": "OCR + AI Agent"
            }
            
        # Route 2: CSV/Excel (Pandas + Legacy mapping)
        else:
            db = await get_supabase()
            df, col_mapping, warnings = await ingestion_service.parse_file(db, content, filename)
            preview = df.head(10).to_dict(orient="records")
            
            return {
                "preview": preview,
                "columns": list(df.columns),
                "col_mapping": col_mapping,
                "total_rows": len(df),
                "warnings": warnings,
                "method": "Pandas"
            }
        
    except Exception as e:
        logger.error(f"Extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))