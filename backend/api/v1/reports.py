"""
API v1 — Reports
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.report import Report
from schemas.report import ReportGenerateRequest, ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=list[ReportResponse])
async def list_reports(
    institution_id: Optional[int] = Query(None),
    report_type: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(Report)
    if institution_id:
        query = query.where(Report.institution_id == institution_id)
    if report_type:
        query = query.where(Report.report_type == report_type)
    query = query.order_by(Report.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/generate", response_model=ReportResponse, status_code=201)
async def generate_report(
    body: ReportGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate a report (PDF/Excel). AI summary via teammate's report_writer agent."""
    # Create report record
    report = Report(
        title=body.title,
        report_type=body.report_type,
        scope=body.scope,
        institution_id=body.institution_id,
        domain_id=body.domain_id,
        period_start=body.period_start,
        period_end=body.period_end,
        format=body.format,
        generated_by="system",
    )

    # Try to call the AI report writer agent (teammate's code)
    try:
        from agents.report_writer import write_report
        if body.institution_id:
            from models.institution import Institution
            inst_result = await db.execute(
                select(Institution).where(Institution.id == body.institution_id)
            )
            inst = inst_result.scalar_one_or_none()
            inst_name = inst.name if inst else "Unknown"
        else:
            inst_name = "University of Carthage"

        # The agent will fill this when implemented
        summary = write_report(
            institution=inst_name,
            period=f"{body.period_start} to {body.period_end}",
            all_kpis={},
        )
        report.ai_summary = summary
    except Exception:
        report.ai_summary = "AI summary pending — agent not yet configured."

    db.add(report)
    await db.flush()
    await db.refresh(report)
    return report


@router.get("/templates")
async def report_templates():
    """Available report templates."""
    return [
        {"id": "summary", "name": "Executive Summary", "description": "High-level KPI overview"},
        {"id": "academic", "name": "Academic Report", "description": "Success, dropout, attendance rates"},
        {"id": "finance", "name": "Financial Report", "description": "Budget execution, cost analysis"},
        {"id": "hr", "name": "HR Report", "description": "Staff metrics, absenteeism, training"},
        {"id": "full", "name": "Full Annual Report", "description": "All domains combined"},
    ]
