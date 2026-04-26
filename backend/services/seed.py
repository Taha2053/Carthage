"""
Seed script for CARTHAGE using Supabase Python SDK.
Run with: cd backend && uv run python services/seed.py
"""

import os
from datetime import datetime, timedelta
from math import copysign

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


def get_supabase_client() -> Client:
    """Create Supabase client from environment."""
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "") or os.getenv("SUPABASE_KEY", "")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
    
    return create_client(supabase_url, supabase_key)


# Institution definitions - aligned with dim_institution table
INSTITUTIONS = [
    {
        "code": "supcom",
        "name": "Sup'Com",
        "short_name": "Sup'Com",
        "city": "Tunis",
        "region": "Grand Tunis",
        "institution_type": "engineering",
    },
    {
        "code": "ept",
        "name": "Ecole Polytechnique de Tunisie",
        "short_name": "EPT",
        "city": "La Marsa",
        "region": "Grand Tunis",
        "institution_type": "engineering",
    },
    {
        "code": "ihec",
        "name": "Institut des Hautes Etudes Commerciales de Carthage",
        "short_name": "IHEC",
        "city": "Carthage",
        "region": "Grand Tunis",
        "institution_type": "business",
    },
    {
        "code": "insat",
        "name": "Institut National des Sciences Appliquées et de Technologie",
        "short_name": "INSAT",
        "city": "Tunis",
        "region": "Grand Tunis",
        "institution_type": "engineering",
    },
    {
        "code": "fsb",
        "name": "Faculté des Sciences de Bizerte",
        "short_name": "FSB",
        "city": "Bizerte",
        "region": "Nord",
        "institution_type": "science",
    },
]


# Domain IDs from dim_domain
DOMAIN_IDS = {
    "ACADEMIC": 1,
    "FINANCE": 2,
    "HR": 3,
    "ENROLLMENT": 4,
}


# Base KPI values per institution (first semester)
BASE_KPIS = {
    "supcom": {"ACAD_SUCCESS_RATE": 81.2, "ACAD_DROPOUT_RATE": 6.3, "FIN_BUDGET_EXEC_RATE": 88.9, "HR_ABSENTEEISM_RATE": 5.8, "ENR_FILL_RATE": 92.0},
    "ept": {"ACAD_SUCCESS_RATE": 89.1, "ACAD_DROPOUT_RATE": 3.1, "FIN_BUDGET_EXEC_RATE": 64.7, "HR_ABSENTEEISM_RATE": 2.8, "ENR_FILL_RATE": 95.0},
    "ihec": {"ACAD_SUCCESS_RATE": 58.7, "ACAD_DROPOUT_RATE": 21.4, "FIN_BUDGET_EXEC_RATE": 79.3, "HR_ABSENTEEISM_RATE": 16.2, "ENR_FILL_RATE": 78.0},
    "insat": {"ACAD_SUCCESS_RATE": 76.4, "ACAD_DROPOUT_RATE": 8.9, "FIN_BUDGET_EXEC_RATE": 71.2, "HR_ABSENTEEISM_RATE": 6.4, "ENR_FILL_RATE": 85.0},
    "fsb": {"ACAD_SUCCESS_RATE": 67.8, "ACAD_DROPOUT_RATE": 13.7, "FIN_BUDGET_EXEC_RATE": 55.4, "HR_ABSENTEEISM_RATE": 9.3, "ENR_FILL_RATE": 72.0},
}


# Trend behavior per month
TRENDS = {
    "supcom": {"ACAD_SUCCESS_RATE": -0.5, "FIN_BUDGET_EXEC_RATE": 3.5, "HR_ABSENTEEISM_RATE": 0.2},
    "ept": {"ACAD_SUCCESS_RATE": 0.4, "FIN_BUDGET_EXEC_RATE": 0.8, "HR_ABSENTEEISM_RATE": -0.2},
    "ihec": {"ACAD_SUCCESS_RATE": -2.1, "FIN_BUDGET_EXEC_RATE": -1.2, "HR_ABSENTEEISM_RATE": 1.1},
    "insat": {"ACAD_SUCCESS_RATE": -0.8, "FIN_BUDGET_EXEC_RATE": 1.5, "HR_ABSENTEEISM_RATE": -0.4},
    "fsb": {"ACAD_SUCCESS_RATE": 1.9, "FIN_BUDGET_EXEC_RATE": 2.8, "HR_ABSENTEEISM_RATE": -0.9},
}


def _round_2(value: float) -> float:
    return round(value, 2)


def seed_institutions(supabase: Client):
    """Insert or update institution records into dim_institution."""
    print("\nSeeding institutions...")
    for inst in INSTITUTIONS:
        try:
            response = supabase.table("dim_institution").upsert(inst, on_conflict="code").execute()
            if response.data:
                print(f"  ✓ {inst['name']}")
            else:
                print(f"  ✗ {inst['name']}: {response}")
        except Exception as e:
            print(f"  ✗ {inst['name']}: {e}")
    print("Done seeding institutions.")


def seed_time_dim(supabase: Client):
    """Ensure time dimensions exist for last 3 semesters."""
    print("\nSeeding time dimensions...")
    
    now = datetime.utcnow()
    semesters = [
        {"year": 2025, "semester": 1, "month": 9, "label": "S1 2024-2025"},
        {"year": 2025, "semester": 2, "month": 3, "label": "S2 2024-2025"},
        {"year": 2026, "semester": 1, "month": 9, "label": "S1 2025-2026"},
    ]
    
    for sem in semesters:
        full_date = datetime(sem["year"], sem["month"], 1)
        record = {
            "full_date": full_date.strftime("%Y-%m-%d"),
            "day": 1,
            "month": sem["month"],
            "month_name": full_date.strftime("%B"),
            "semester": sem["semester"],
            "academic_year": f"{sem['year']-1}-{sem['year']}",
            "year": sem["year"],
        }
        try:
            response = supabase.table("dim_time").upsert(record, on_conflict="full_date").execute()
        except Exception as e:
            print(f"  Time insert error: {e}")
    
    print("Done seeding time dimensions.")


def seed_metric_dim(supabase: Client):
    """Ensure metrics exist in dim_metric."""
    print("\nSeeding metrics...")
    
    metrics_def = [
        ("ACAD_SUCCESS_RATE", "Success Rate", "Taux de réussite", "ACADEMIC", "%"),
        ("ACAD_DROPOUT_RATE", "Dropout Rate", "Taux d'abandon", "ACADEMIC", "%"),
        ("FIN_BUDGET_EXEC_RATE", "Budget Execution", "Taux d'exécution budgétaire", "FINANCE", "%"),
        ("HR_ABSENTEEISM_RATE", "Absenteeism Rate", "Taux d'absentéisme", "HR", "%"),
        ("ENR_FILL_RATE", "Program Fill Rate", "Taux de remplissage", "ENROLLMENT", "%"),
    ]
    
    for code, name, name_fr, domain, unit in metrics_def:
        domain_id = DOMAIN_IDS.get(domain, 1)
        record = {
            "code": code,
            "name": name,
            "name_fr": name_fr,
            "domain_id": domain_id,
            "unit": unit,
            "aggregation": "AVG",
            "higher_is_better": True,
            "warning_threshold": 70,
            "critical_threshold": 50,
        }
        try:
            response = supabase.table("dim_metric").upsert(record, on_conflict="code").execute()
        except Exception as e:
            print(f"  Metric insert error: {e}")
    
    print("Done seeding metrics.")


def seed_fact_kpis(supabase: Client):
    """Insert KPI data into fact_kpis table."""
    print("\nSeeding fact_kpis...")
    
    # Get institution IDs
    inst_response = supabase.table("dim_institution").select("id, code").execute()
    inst_map = {row["code"]: row["id"] for row in inst_response.data}
    
    # Get time IDs
    time_response = supabase.table("dim_time").select("id, semester, academic_year").order("academic_year, semester").execute()
    time_data = [(row["id"], row["semester"], row["academic_year"]) for row in time_response.data]
    
    # Get metric IDs
    metric_response = supabase.table("dim_metric").select("id, code").execute()
    metric_map = {row["code"]: row["id"] for row in metric_response.data}
    
    if not inst_map or not time_data or not metric_map:
        print("  ERROR: Need institutions, time, and metrics first")
        return
    
    total_inserted = 0
    
    for inst_code in inst_map:
        inst_id = inst_map[inst_code]
        base = BASE_KPIS.get(inst_code, {})
        inst_trends = TRENDS.get(inst_code, {})
        
        for time_idx, (time_id, semester, acad_year) in enumerate(time_data):
            for metric_code, base_value in base.items():
                metric_id = metric_map.get(metric_code)
                if not metric_id:
                    continue
                
                # Calculate value with trend
                trend = inst_trends.get(metric_code, 0.0)
                if time_idx == 0:
                    value = _round_2(base_value)
                    value_previous = None
                else:
                    trend_change = trend * time_idx
                    noise = ((time_idx * 7) % 5 - 2) * 0.2
                    value = _round_2(base_value + trend_change + noise)
                    value_previous = _round_2(base_value + trend_change if trend != 0 else base_value)
                
                record = {
                    "institution_id": inst_id,
                    "time_id": time_id,
                    "metric_id": metric_id,
                    "value": value,
                    "value_previous": value_previous,
                    "source": "seed",
                }
                
                try:
                    # Try upsert first - if fails, just insert
                    response = supabase.table("fact_kpis").upsert(record, on_conflict="institution_id,time_id,metric_id").execute()
                    if not response.data:
                        raise Exception("No data")
                    total_inserted += 1
                except:
                    # If upsert fails, delete existing and re-insert
                    try:
                        supabase.table("fact_kpis").delete().match({
                            "institution_id": inst_id, 
                            "time_id": time_id, 
                            "metric_id": metric_id
                        }).execute()
                    except:
                        pass
                    try:
                        response = supabase.table("fact_kpis").insert(record).execute()
                        if response.data:
                            total_inserted += 1
                    except Exception as e:
                        print(f"  Error: {e}")
    
    print(f"  Inserted {total_inserted} KPI records")
    print("Done seeding fact_kpis.")


def main():
    print("=" * 50)
    print("CARTHAGE Seed Script (Supabase SDK)")
    print("=" * 50)
    
    try:
        supabase = get_supabase_client()
        print("Connected to Supabase!")
    except Exception as e:
        print(f"ERROR: Could not connect to Supabase: {e}")
        return
    
    # Seed in order
    seed_institutions(supabase)
    seed_time_dim(supabase)
    seed_metric_dim(supabase)
    seed_fact_kpis(supabase)
    
    print("\n" + "=" * 50)
    print("Seed complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()