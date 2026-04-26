"""
KPI Engine for CARTHAGE.
Sync version using Supabase client directly.
"""

from typing import Any, Optional
from supabase import Client
from core.database import supabase


class KPIEngine:
    """KPI Engine using Supabase sync client."""
    
    def get_latest_kpis(self, db: Client, institution_id: Optional[int] = None, domain_code: Optional[str] = None):
        query = db.table("fact_kpis").select("*")
        if institution_id:
            query = query.eq("institution_id", institution_id)
        if domain_code:
            query = query.eq("domain_code", domain_code)
        query = query.order("recorded_at", desc=True).limit(100)
        return query.execute().data
    
    def get_department_kpis(self, db: Client, institution_id: Optional[int], department_id: int):
        query = db.table("fact_kpis").select("*").eq("department_id", department_id)
        if institution_id:
            query = query.eq("institution_id", institution_id)
        return query.execute().data
    
    def get_comparison(self, db: Client, metric_code: str):
        query = db.table("fact_kpis").select("institution_id, value").eq("metric_code", metric_code).order("value", desc=True).limit(20)
        return query.execute().data
    
    def get_trends(self, db: Client, metric_code: str, institution_id: Optional[int] = None):
        query = db.table("fact_kpis").select("recorded_at, value").eq("metric_code", metric_code).order("recorded_at").limit(30)
        if institution_id:
            query = query.eq("institution_id", institution_id)
        return query.execute().data
    
    def get_domain_averages(self, db: Client, academic_year: Optional[str] = None):
        return {"academic": 0, "finance": 0, "hr": 0}
    
    def get_network_comparison(self, db: Client, metric_code: str, academic_year: Optional[str] = None):
        return []
    
    def get_dept_rankings(self, db: Client, institution_id: int):
        return []
    
    def get_success_rates(self, db: Client, institution_id: Optional[int] = None, academic_year: Optional[str] = None):
        return []
    
    def get_dropout_rates(self, db: Client, institution_id: Optional[int] = None, academic_year: Optional[str] = None):
        return []
    
    def get_attendance_rates(self, db: Client, institution_id: Optional[int] = None):
        return []
    
    def get_budget_execution(self, db: Client, institution_id: Optional[int] = None, fiscal_year: Optional[str] = None):
        return []
    
    def get_employability(self, db: Client, institution_id: Optional[int] = None):
        return []
    
    def get_hr_summary(self, db: Client, institution_id: Optional[int] = None, academic_year: Optional[str] = None):
        return []
    
    def refresh_materialized_views(self, db: Client):
        return {"status": "ok"}


# Module-level instance
kpi_engine = KPIEngine()


# Importable functions that API expects
def get_latest_kpis(db, institution_id: Optional[int] = None, domain_code: Optional[str] = None):
    return kpi_engine.get_latest_kpis(db, institution_id, domain_code)

def get_department_kpis(db, institution_id: Optional[int], department_id: int):
    return kpi_engine.get_department_kpis(db, institution_id, department_id)

def get_comparison(db, metric_code: str):
    return kpi_engine.get_comparison(db, metric_code)

def get_trends(db, metric_code: str, institution_id: Optional[int] = None):
    return kpi_engine.get_trends(db, metric_code, institution_id)

def get_domain_averages(db, academic_year: Optional[str] = None):
    return kpi_engine.get_domain_averages(db, academic_year)


# Compute KPIs from raw data
def compute_kpis(raw_rows: list[dict], institution_id: str) -> dict[str, dict[str, Any]]:
    """Compute KPIs from raw data rows."""
    if not raw_rows:
        return {
            "taux_reussite": {"value": 0, "domain": "academic"},
            "taux_abandon": {"value": 0, "domain": "academic"},
            "taux_presence": {"value": 0, "domain": "academic"},
            "budget_consomme": {"value": 0, "domain": "finance"},
        }
    
    result = {}
    
    # Success rate
    total = sum(row.get("total_students", row.get("total", 0)) for row in raw_rows)
    passed = sum(row.get("passed", row.get("reussis", 0)) for row in raw_rows)
    result["taux_reussite"] = {"value": round(passed/total*100, 2) if total > 0 else 0, "domain": "academic"}
    
    # Dropout rate
    enrolled = sum(row.get("total_enrolled", row.get("inscrits", 0)) for row in raw_rows)
    dropped = sum(row.get("dropped", row.get("abandon", 0)) for row in raw_rows)
    result["taux_abandon"] = {"value": round(dropped/enrolled*100, 2) if enrolled > 0 else 0, "domain": "academic"}
    
    # Attendance
    total_days = sum(row.get("total_days", 0) for row in raw_rows)
    present = sum(row.get("present_days", 0) for row in raw_rows)
    result["taux_presence"] = {"value": round(present/total_days*100, 2) if total_days > 0 else 0, "domain": "academic"}
    
    # Budget
    allocated = sum(row.get("allocated", 0) for row in raw_rows)
    consumed = sum(row.get("consumed", 0) for row in raw_rows)
    result["budget_consomme"] = {"value": round(consumed/allocated*100, 2) if allocated > 0 else 0, "domain": "finance"}
    
    return result