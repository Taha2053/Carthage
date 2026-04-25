"""
API v1 — Data Upload Endpoint
"""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.upload import UploadResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse)
async def upload_data(
    domain_code: str = Query(..., description="E.g., STU, HR, FIN"),
    institution_id: Optional[int] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """
    Mock endpoint to represent uploading a CSV/Excel file for a specific domain.
    """
    # Simulate processing
    rows_inserted = 42
    
    # Log the upload
    insert_data = {
        "filename": f"data_{domain_code}.csv",
        "status": "success",
        "records_processed": rows_inserted,
        "domain_code": domain_code,
        "institution_id": institution_id,
        "file_format": "csv"
    }
    
    try:
        resp = await db.table("upload_log").insert(insert_data).execute()
        log_id = resp.data[0]["id"] if resp.data else 0
    except Exception as e:
        logger.error(f"Failed to log upload: {e}")
        log_id = 0

    return UploadResponse(
        message=f"Successfully processed {rows_inserted} rows for domain {domain_code}",
        rows_inserted=rows_inserted,
        log_id=log_id,
    )
