"""
API v1 — Students CRUD
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from core.database import get_db
from schemas.student import StudentCreate, StudentResponse, StudentSummary, StudentUpdate

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=list[StudentResponse])
async def list_students(
    institution_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    academic_year: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db=Depends(get_db),
):
    """List students with filters."""
    query = db.table("dim_student").select("*")
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if department_id:
        query = query.eq("department_id", department_id)
    if status:
        query = query.eq("status", status)
    if academic_year:
        query = query.eq("academic_year", academic_year)
    if level:
        query = query.eq("level", level)
    query = query.order("last_name").order("first_name").range(offset, offset + limit - 1)
    
    response = query.execute()
    return response.data


@router.get("/summary", response_model=StudentSummary)
async def student_summary(
    institution_id: int = Query(...),
    academic_year: Optional[str] = Query(None),
    db=Depends(get_db),
):
    """Aggregated student statistics for an institution."""
    base_query = db.table("dim_student").select("id", count="exact").eq("institution_id", institution_id)
    if academic_year:
        base_query = base_query.eq("academic_year", academic_year)

    async def get_count(q):
        resp = await q.execute()
        return resp.count if resp.count is not None else 0

    # Total
    total = await get_count(base_query)
    # Enrolled
    enrolled = await get_count(base_query.eq("status", "enrolled"))
    # Graduated
    graduated = await get_count(base_query.eq("status", "graduated"))
    # Dropout
    dropout = await get_count(base_query.eq("status", "dropout"))
    # Repeating
    repeating = await get_count(base_query.eq("status", "repeating"))
    # Scholarship
    scholarship = await get_count(base_query.eq("is_scholarship", True))
    # Foreign
    foreign = await get_count(base_query.eq("is_foreign", True))

    return StudentSummary(
        institution_id=institution_id,
        total_enrolled=enrolled,
        total_graduated=graduated,
        total_dropout=dropout,
        total_repeating=repeating,
        scholarship_count=scholarship,
        foreign_count=foreign,
    )


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db=Depends(get_db)):
    response = db.table("dim_student").select("*").eq("id", student_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return response.data[0]


@router.post("", response_model=StudentResponse, status_code=201)
async def create_student(data: StudentCreate, db=Depends(get_db)):
    response = db.table("dim_student").insert(data.model_dump(exclude_unset=True)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create student")
    return response.data[0]


@router.patch("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int, data: StudentUpdate, db=Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_student(student_id, db)
        
    response = db.table("dim_student").update(update_data).eq("id", student_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return response.data[0]
