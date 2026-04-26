"""
API v1 — Data Catalog
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query
from core.database import get_db

router = APIRouter(prefix="/data-catalog", tags=["Data Catalog"])


@router.get("")
async def search_catalog(
    q: Optional[str] = Query(None, description="Search term"),
    institution_id: Optional[int] = Query(None),
    data_type: Optional[str] = Query(None),
    db=Depends(get_db),
):
    """Search all datasets — like Google for university data."""
    query = db.table("data_catalog").select("*")
    if q:
        query = query.ilike("name", f"%{q}%")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if data_type:
        query = query.eq("data_type", data_type)
    query = query.order("access_count", desc=True).limit(50)
    
    response = query.execute()
    return response.data


@router.get("/stats")
async def catalog_stats(db=Depends(get_db)):
    """Usage statistics across all data."""
    # Supabase aggregate queries require workarounds or calling RPC.
    # For now we'll do in-memory for the last 1000 logs if no RPC exists, 
    # but a better approach would be an RPC function.
    
    # Just returning a placeholder since aggregation via REST is limited.
    # We can fetch the counts manually
    total_resp = db.table("upload_log").select("id", count="exact").execute()
    total_uploads = total_resp.count if total_resp.count is not None else 0
    
    dup_resp = db.table("upload_log").select("id", count="exact").eq("is_duplicate", True).execute()
    duplicates = dup_resp.count if dup_resp.count is not None else 0
    
    # We'll fetch rows to sum/avg since REST doesn't natively support sum/avg without RPC
    rows_resp = db.table("upload_log").select("rows_inserted, data_quality_score").limit(1000).execute()
    total_records = 0
    quality_scores = []
    
    for r in rows_resp.data:
        if r.get("rows_inserted"):
            total_records += r.get("rows_inserted")
        if r.get("data_quality_score") is not None:
            quality_scores.append(r.get("data_quality_score"))
            
    avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
    
    return {
        "total_uploads": total_uploads,
        "total_records_inserted": total_records,
        "average_quality_score": round(float(avg_quality), 2),
        "duplicate_uploads_blocked": duplicates,
    }
