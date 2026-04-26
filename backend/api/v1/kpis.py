"""
API v1 — KPIs (Dashboard Data)
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Path
from core.database import supabase

router = APIRouter(prefix="/kpis", tags=["KPIs"])


@router.get("")
def get_latest_kpis(
    institution_id: Optional[int] = Query(None),
    domain_code: Optional[str] = Query(None),
):
    """All latest KPIs from fact_kpis."""
    query = supabase.table("fact_kpis").select("*, dim_metric(code, name), dim_time(academic_year, semester)")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if domain_code:
        query = query.eq("dim_metric.domain_code", domain_code)
    result = query.execute().data
    return result


@router.get("/institution/{institution_id}")
def get_institution_kpis(institution_id: int):
    """KPIs for one institution."""
    query = supabase.table("fact_kpis").select("*, dim_metric(code, name)").eq("institution_id", institution_id)
    return query.execute().data


@router.get("/department/{department_id}")
def get_department_kpis(
    department_id: int,
    institution_id: Optional[int] = Query(None),
):
    """KPIs for one department."""
    query = supabase.table("fact_kpis").select("*, dim_metric(code, name)").eq("department_id", department_id)
    if institution_id:
        query = query.eq("institution_id", institution_id)
    return query.execute().data


@router.get("/domain/{domain_code}")
def get_domain_kpis(domain_code: str):
    """KPIs filtered by domain."""
    query = supabase.table("fact_kpis").select("*, dim_metric(code, name)").eq("dim_metric.domain_code", domain_code)
    return query.execute().data


@router.get("/compare")
def compare_institutions(metric_code: str = Query(..., description="Metric code to compare")):
    """Cross-institution comparison."""
    query = supabase.table("fact_kpis").select("institution_id, value, dim_institution(code, short_name)").eq("metric_id", metric_code).order("value", desc=True).limit(20)
    return query.execute().data