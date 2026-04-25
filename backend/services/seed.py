"""
Seed script for CARTHAGE.
Inserts institutions and KPI data aligned with the DB schema.
Run with: cd backend && uv run python services/seed.py
"""

import asyncio
import os
from datetime import datetime, timedelta
from math import copysign

import asyncpg
from dotenv import load_dotenv

load_dotenv()


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


# Metric definitions - aligned with dim_metric table
# Using exact codes from migration 000b_seed_data.sql
METRICS = [
    {"code": "ACAD_SUCCESS_RATE", "domain": "ACADEMIC"},
    {"code": "ACAD_DROPOUT_RATE", "domain": "ACADEMIC"},
    {"code": "FIN_BUDGET_EXEC_RATE", "domain": "FINANCE"},
    {"code": "HR_ABSENTEEISM_RATE", "domain": "HR"},
    {"code": "ENR_FILL_RATE", "domain": "ENROLLMENT"},
]


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


async def seed_institutions(conn):
    """Insert or update institution records into dim_institution."""
    print("\nSeeding institutions...")
    for inst in INSTITUTIONS:
        try:
            await conn.execute("""
                INSERT INTO dim_institution (code, name, short_name, city, region, institution_type)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    short_name = EXCLUDED.short_name,
                    city = EXCLUDED.city,
                    region = EXCLUDED.region,
                    institution_type = EXCLUDED.institution_type
            """, inst["code"], inst["name"], inst["short_name"], inst["city"], inst["region"], inst["institution_type"])
            print(f"  ✓ {inst['name']}")
        except Exception as e:
            print(f"  ✗ {inst['name']}: {e}")
    print("Done seeding institutions.")


async def seed_time_dim(conn):
    """Ensure time dimensions exist for last 3 semesters."""
    print("\nSeeding time dimensions...")
    
    # Generate last 3 semesters
    now = datetime.utcnow()
    semesters = [
        {"year": 2025, "semester": 1, "month": 9, "label": "S1 2024-2025"},
        {"year": 2025, "semester": 2, "month": 3, "label": "S2 2024-2025"},
        {"year": 2026, "semester": 1, "month": 9, "label": "S1 2025-2026"},
    ]
    
    for sem in semesters:
        full_date = datetime(sem["year"], sem["month"], 1)
        try:
            await conn.execute("""
                INSERT INTO dim_time (full_date, day, month, month_name, semester, academic_year, year)
                VALUES ($1, 1, $2, $3, $4, $5, $6)
                ON CONFLICT (full_date) DO NOTHING
            """, full_date, sem["month"], full_date.strftime("%B"), sem["semester"], f"{sem['year']-1}-{sem['year']}", sem["year"])
        except Exception as e:
            print(f"  Time insert error: {e}")
    
    print("Done seeding time dimensions.")


async def seed_metric_dim(conn):
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
        try:
            domain_id = DOMAIN_IDS.get(domain, 1)
            await conn.execute("""
                INSERT INTO dim_metric (code, name, name_fr, domain_id, unit, aggregation, higher_is_better, warning_threshold, critical_threshold)
                VALUES ($1, $2, $3, $4, $5, 'AVG', TRUE, 70, 50)
                ON CONFLICT (code) DO NOTHING
            """, code, name, name_fr, domain_id, unit)
        except Exception as e:
            print(f"  Metric insert error: {e}")
    
    print("Done seeding metrics.")


async def seed_fact_kpis(conn):
    """Insert KPI data into fact_kpis table."""
    print("\nSeeding fact_kpis...")
    
    # Get institution IDs
    inst_rows = await conn.fetch("SELECT id, code FROM dim_institution")
    inst_map = {row["code"]: row["id"] for row in inst_rows}
    
    # Get time IDs
    time_rows = await conn.fetch("SELECT id, semester, academic_year FROM dim_time ORDER BY academic_year, semester")
    time_map = [(row["id"], row["semester"], row["academic_year"]) for row in time_rows]
    
    # Get metric IDs
    metric_rows = await conn.fetch("SELECT id, code FROM dim_metric")
    metric_map = {row["code"]: row["id"] for row in metric_rows}
    
    if not inst_map or not time_map or not metric_map:
        print("  ERROR: Need institutions, time, and metrics first")
        return
    
    total_inserted = 0
    
    for inst_code in inst_map:
        inst_id = inst_map[inst_code]
        base = BASE_KPIS.get(inst_code, {})
        inst_trends = TRENDS.get(inst_code, {})
        
        # Calculate value_previous from trends
        for time_idx, (time_id, semester, acad_year) in enumerate(time_map):
            for metric_code, base_value in base.items():
                metric_id = metric_map.get(metric_code)
                if not metric_id:
                    continue
                
                # Calculate value with trend
                trend = inst_trends.get(metric_code, 0.0)
                if time_idx == 0:
                    # First semester - base value
                    value = _round_2(base_value)
                    value_previous = None
                else:
                    # Subsequent semesters - apply trend
                    trend_change = trend * time_idx
                    noise = ((time_idx * 7) % 5 - 2) * 0.2
                    value = _round_2(base_value + trend_change + noise)
                    value_previous = _round_2(base_value + trend_change if trend != 0 else base_value)
                
                try:
                    await conn.execute("""
                        INSERT INTO fact_kpis (institution_id, time_id, metric_id, value, value_previous, source)
                        VALUES ($1, $2, $3, $4, $5, 'seed')
                        ON CONFLICT (institution_id, time_id, metric_id) DO UPDATE SET
                            value = EXCLUDED.value,
                            value_previous = EXCLUDED.value_previous
                    """, inst_id, time_id, metric_id, value, value_previous)
                    total_inserted += 1
                except Exception as e:
                    print(f"  Error: {e}")
    
    print(f"  Inserted {total_inserted} KPI records")
    print("Done seeding fact_kpis.")


async def main():
    print("=" * 50)
    print("CARTHAGE Seed Script (Aligned)")
    print("=" * 50)
    
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set in .env")
        return
    
    raw_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(raw_url)
        print(f"Connected to: {raw_url[:40]}...")
    except Exception as e:
        print(f"ERROR: Could not connect: {e}")
        return
    
    # Seed in order
    await seed_institutions(conn)
    await seed_time_dim(conn)
    await seed_metric_dim(conn)
    await seed_fact_kpis(conn)
    
    await conn.close()
    
    print("\n" + "=" * 50)
    print("Seed complete!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())