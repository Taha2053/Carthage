"""
API v1 — Research Projects CRUD
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase._async.client import AsyncClient
from core.database import get_db
from schemas.research import ResearchProjectCreate, ResearchProjectResponse, ResearchProjectUpdate

router = APIRouter(prefix="/research", tags=["Research"])


@router.get("", response_model=list[ResearchProjectResponse])
async def list_research_projects(
    institution_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    is_funded: Optional[bool] = Query(None),
    db: AsyncClient = Depends(get_db),
):
    """List research projects with filters."""
    query = db.table("dim_research_project").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if status:
        query = query.eq("status", status)
    if is_funded is not None:
        query = query.eq("is_funded", is_funded)
    query = query.order("title")
    
    response = await query.execute()
    return response.data


@router.get("/{project_id}", response_model=ResearchProjectResponse)
async def get_research_project(project_id: int, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_research_project").select("*").eq("id", project_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Research project not found")
    return response.data[0]


@router.post("", response_model=ResearchProjectResponse, status_code=201)
async def create_research_project(data: ResearchProjectCreate, db: AsyncClient = Depends(get_db)):
    response = await db.table("dim_research_project").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create research project")
    return response.data[0]


@router.patch("/{project_id}", response_model=ResearchProjectResponse)
async def update_research_project(
    project_id: int, data: ResearchProjectUpdate, db: AsyncClient = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_research_project(project_id, db)
        
    response = await db.table("dim_research_project").update(update_data).eq("id", project_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Research project not found")
    return response.data[0]
