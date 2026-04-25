"""
API v1 — Reports CRUD
"""

from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.report import ReportCreate, ReportResponse, ReportUpdate

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=list[ReportResponse])
async def list_reports(
    institution_id: Optional[int] = Query(None),
    report_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    query = db.table("reports").select("*")
    if institution_id is not None:
        query = query.eq("institution_id", institution_id)
    if report_type:
        query = query.eq("report_type", report_type)
    if status:
        query = query.eq("status", status)
    query = query.order("created_at", desc=True)
    
    response = await query.execute()
    return response.data


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: AsyncClient = Depends(get_db)):
    response = await db.table("reports").select("*").eq("id", report_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return response.data[0]


@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(data: ReportCreate, db: AsyncClient = Depends(get_db)):
    response = await db.table("reports").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create report")
    return response.data[0]


@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    data: ReportUpdate,
    db: AsyncClient = Depends(get_db),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_report(report_id, db)
        
    response = await db.table("reports").update(update_data).eq("id", report_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return response.data[0]


@router.post("/{report_id}/download")
async def register_download(report_id: int, db: AsyncClient = Depends(get_db)):
    """Increment the download count for a report."""
    # First get current
    resp = await db.table("reports").select("download_count").eq("id", report_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Report not found")
    
    current_count = resp.data[0].get("download_count", 0) or 0
    
    # Then update
    update_resp = await db.table("reports").update({"download_count": current_count + 1}).eq("id", report_id).execute()
    return {"message": "Download registered", "download_count": update_resp.data[0].get("download_count")}
