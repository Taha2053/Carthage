"""
API v1 — Data Upload (Excel Ingestion)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.events import event_bus
from schemas.upload import UploadResponse, UploadValidationResult
from services.ingestion import ingestion_service
from services.kpi_engine import kpi_engine
from services.alert_engine import alert_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    institution_id: int = Query(..., description="Target institution ID"),
    uploaded_by: str = Query(None, description="Who uploaded"),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload an Excel file (.xlsx) for data ingestion.
    
    The file goes through:
    1. Parse Excel → JSON
    2. Validate against DB constraints
    3. Deduplication check (SHA-256)
    4. Insert into fact_kpis
    5. Trigger event pipeline → KPI recompute → Alert generation
    """
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx/.xls files are accepted")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    try:
        result = await ingestion_service.ingest(
            file_content=content,
            filename=file.filename,
            institution_id=institution_id,
            db=db,
            uploaded_by=uploaded_by,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # If not duplicate and data was inserted, trigger the event pipeline
    if result["status"] == "completed" and result["rows_inserted"] > 0:
        # 1. Refresh materialized views
        await kpi_engine.refresh_materialized_views(db)

        # 2. Generate alerts
        await alert_engine.generate_alerts(db)

        # 3. Publish event for WebSocket push
        await event_bus.publish("data_uploaded", {
            "institution_id": institution_id,
            "filename": file.filename,
            "rows_inserted": result["rows_inserted"],
            "quality_score": result.get("data_quality_score"),
        })

        logger.info(f"🚀 Full pipeline triggered for {file.filename}")

    return UploadResponse(
        upload_id=result.get("upload_id", 0),
        filename=file.filename,
        institution_id=institution_id,
        **{k: v for k, v in result.items() if k != "upload_id"},
    )


@router.post("/validate", response_model=UploadValidationResult)
async def validate_file(
    file: UploadFile = File(...),
    institution_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Validate an Excel file without saving — preview mode."""
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx/.xls files are accepted")

    content = await file.read()

    try:
        df, col_mapping, warnings = await ingestion_service.parse_excel(content, file.filename)
        valid_rows, invalid_rows, errors = await ingestion_service.validate_data(
            df, col_mapping, db
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    total = len(valid_rows) + len(invalid_rows)

    return UploadValidationResult(
        is_valid=len(invalid_rows) == 0,
        total_rows=total,
        valid_rows=len(valid_rows),
        invalid_rows=len(invalid_rows),
        errors=errors[:50],
        warnings=warnings,
        detected_metrics=list(set(
            str(r.get(col_mapping.get("metric_code", ""), "")).upper()
            for r in valid_rows
            if col_mapping.get("metric_code")
        )),
        preview=valid_rows[:10],
    )
