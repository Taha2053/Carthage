"""
API v1 — Data Catalog
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.data_catalog import DataCatalog
from models.upload_log import UploadLog

router = APIRouter(prefix="/data-catalog", tags=["Data Catalog"])


@router.get("")
async def search_catalog(
    q: Optional[str] = Query(None, description="Search term"),
    institution_id: Optional[int] = Query(None),
    data_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Search all datasets — like Google for university data."""
    query = select(DataCatalog)
    if q:
        query = query.where(DataCatalog.name.ilike(f"%{q}%"))
    if institution_id:
        query = query.where(DataCatalog.institution_id == institution_id)
    if data_type:
        query = query.where(DataCatalog.data_type == data_type)
    query = query.order_by(DataCatalog.access_count.desc()).limit(50)
    result = await db.execute(query)
    items = result.scalars().all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "description": i.description,
            "data_type": i.data_type,
            "institution_id": i.institution_id,
            "access_count": i.access_count,
            "relevance_score": float(i.relevance_score) if i.relevance_score else None,
            "storage_tier": i.storage_tier,
        }
        for i in items
    ]


@router.get("/stats")
async def catalog_stats(db: AsyncSession = Depends(get_db)):
    """Usage statistics across all data."""
    total_uploads = await db.execute(select(func.count(UploadLog.id)))
    total_records = await db.execute(select(func.sum(UploadLog.rows_inserted)))
    avg_quality = await db.execute(select(func.avg(UploadLog.data_quality_score)))
    duplicates = await db.execute(
        select(func.count(UploadLog.id)).where(UploadLog.is_duplicate == True)
    )
    return {
        "total_uploads": total_uploads.scalar() or 0,
        "total_records_inserted": total_records.scalar() or 0,
        "average_quality_score": round(float(avg_quality.scalar() or 0), 2),
        "duplicate_uploads_blocked": duplicates.scalar() or 0,
    }
