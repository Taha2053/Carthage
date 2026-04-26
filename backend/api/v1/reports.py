"""
API v1 — Reports CRUD
"""

from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from schemas.report import ReportCreate, ReportResponse, ReportUpdate

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=list[ReportResponse])
async def list_reports(
    institution_id: Optional[int] = Query(None),
    report_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db=Depends(get_db),
):
    query = db.table("reports").select("*")
    if institution_id is not None:
        query = query.eq("institution_id", institution_id)
    if report_type:
        query = query.eq("report_type", report_type)
    if status:
        query = query.eq("status", status)
    query = query.order("created_at", desc=True)
    
    response = query.execute()
    return response.data


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db=Depends(get_db)):
    response = db.table("reports").select("*").eq("id", report_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return response.data[0]


@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(data: ReportCreate, db=Depends(get_db)):
    response = db.table("reports").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create report")
    return response.data[0]


@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    data: ReportUpdate,
    db=Depends(get_db),
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_report(report_id, db)
        
    response = db.table("reports").update(update_data).eq("id", report_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return response.data[0]


@router.post("/{report_id}/download")
async def register_download(report_id: int, db=Depends(get_db)):
    """Increment the download count for a report."""
    # First get current
    resp = db.table("reports").select("download_count").eq("id", report_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Report not found")
    
    current_count = resp.data[0].get("download_count", 0) or 0
    
    # Then update
    update_resp = db.table("reports").update({"download_count": current_count + 1}).eq("id", report_id).execute()
    return {"message": "Download registered", "download_count": update_resp.data[0].get("download_count")}


@router.post("/generate/ai")
async def generate_ai_report(
    institution_id: int, 
    period: str = Query(..., description="e.g. 2024-2025 Semester 1"),
    db=Depends(get_db)
):
    """Trigger the AI Report Writer to generate a comprehensive markdown report."""
    from agents.report_writer import write_report
    
    # 1. Fetch institution name
    inst_resp = db.table("dim_institution").select("name, code").eq("id", institution_id).execute()
    if not inst_resp.data:
        raise HTTPException(status_code=404, detail="Institution not found")
    institution_name = inst_resp.data[0]["name"]
    
    # 2. Fetch all KPIs for this institution to give context to the AI
    # In a real app, you'd filter by the specific time_id matching the period
    kpi_resp = db.table("fact_kpis").select("value, dim_metric(code, name)").eq("institution_id", institution_id).limit(50).execute()
    
    all_kpis = {}
    for row in kpi_resp.data:
        metric = row.get("dim_metric")
        if metric:
            all_kpis[metric["name"]] = row.get("value")
            
    # 3. Call the AI Report Writer Agent
    report_content = await write_report(
        institution=institution_name,
        period=period,
        all_kpis=all_kpis
    )
    
    # 4. Save the generated report to the database
    new_report = {
        "institution_id": institution_id,
        "title": f"Rapport IA - {institution_name} ({period})",
        "report_type": "AI_GENERATED",
        "file_url": "", # Would be populated if we saved the markdown to an actual PDF in storage
        "generated_by": "System (Mistral AI)",
        "status": "published",
        "description": report_content[:200] + "..." # Snippet
    }
    
    insert_resp = db.table("reports").insert(new_report).execute()
    
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to save generated report")
        
    return {
        "report": insert_resp.data[0],
        "markdown_content": report_content
    }
