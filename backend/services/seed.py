"""
Seed script for CARTHAGE.

Inserts 5 institutions with 3 months of KPI data each.
Run with: cd backend && uv run python services/seed.py
"""

import asyncio
import os
from datetime import datetime, timedelta
from math import copysign

import asyncpg
from dotenv import load_dotenv

load_dotenv()


async def seed():
    """Main async entry point."""
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set in .env")
        return
    
    # Convert SQLAlchemy URL to asyncpg format
    raw_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    print(f"Connecting to: {raw_url[:40]}...")
    
    try:
        conn = await asyncpg.connect(raw_url)
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        return


INSTITUTIONS = [
    {
        "code": "supcom",
        "name": "Sup'Com",
        "city": "Tunis",
        "institution_type": "Grande École",
    },
    {
        "code": "ept",
        "name": "Ecole Polytechnique de Tunisie",
        "city": "La Marsa",
        "institution_type": "Grande École",
    },
    {
        "code": "ihec",
        "name": "Institut des Hautes Etudes Commerciales de Carthage",
        "city": "Carthage",
        "institution_type": "Institut",
    },
    {
        "code": "insat",
        "name": "Institut National des Sciences Appliquées et de Technologie",
        "city": "Tunis",
        "institution_type": "Institut",
    },
    {
        "code": "fsb",
        "name": "Faculté des Sciences de Bizerte",
        "city": "Bizerte",
        "institution_type": "Faculté",
    },
]


BASE_KPIS = {
    "supcom": {
        "taux_de_reussite": 81.2,
        "taux_de_presence": 89.4,
        "taux_d_abandon": 6.3,
        "budget_consomme": 88.9,
        "taux_execution_budgetaire": 88.9,
        "taux_absenteisme_rh": 5.8,
        "effectif_enseignant": 198,
    },
    "ept": {
        "taux_de_reussite": 89.1,
        "taux_de_presence": 94.3,
        "taux_d_abandon": 3.1,
        "budget_consomme": 64.7,
        "taux_execution_budgetaire": 64.7,
        "taux_absenteisme_rh": 2.8,
        "effectif_enseignant": 312,
    },
    "ihec": {
        "taux_de_reussite": 58.7,
        "taux_de_presence": 74.3,
        "taux_d_abandon": 21.4,
        "budget_consomme": 79.3,
        "taux_execution_budgetaire": 79.3,
        "taux_absenteisme_rh": 16.2,
        "effectif_enseignant": 276,
    },
    "insat": {
        "taux_de_reussite": 76.4,
        "taux_de_presence": 86.7,
        "taux_d_abandon": 8.9,
        "budget_consomme": 71.2,
        "taux_execution_budgetaire": 71.2,
        "taux_absenteisme_rh": 6.4,
        "effectif_enseignant": 389,
    },
    "fsb": {
        "taux_de_reussite": 67.8,
        "taux_de_presence": 81.2,
        "taux_d_abandon": 13.7,
        "budget_consomme": 55.4,
        "taux_execution_budgetaire": 55.4,
        "taux_absenteisme_rh": 9.3,
        "effectif_enseignant": 445,
    },
}


TRENDS = {
    "supcom": {
        "budget_consomme": 3.5,
        "taux_execution_budgetaire": 3.5,
        "taux_de_reussite": -0.5,
        "taux_de_presence": -0.3,
        "taux_d_abandon": 0.4,
        "taux_absenteisme_rh": 0.2,
        "effectif_enseignant": 0.0,
    },
    "ept": {
        "budget_consomme": 0.8,
        "taux_execution_budgetaire": 0.8,
        "taux_de_reussite": 0.4,
        "taux_de_presence": 0.2,
        "taux_d_abandon": -0.3,
        "taux_absenteisme_rh": -0.2,
        "effectif_enseignant": 1.0,
    },
    "ihec": {
        "budget_consomme": -1.2,
        "taux_execution_budgetaire": -1.2,
        "taux_de_reussite": -2.1,
        "taux_de_presence": -1.8,
        "taux_d_abandon": 1.5,
        "taux_absenteisme_rh": 1.1,
        "effectif_enseignant": -2.0,
    },
    "insat": {
        "budget_consomme": 1.5,
        "taux_execution_budgetaire": 1.5,
        "taux_de_reussite": -0.8,
        "taux_de_presence": 0.5,
        "taux_d_abandon": 0.6,
        "taux_absenteisme_rh": -0.4,
        "effectif_enseignant": 2.0,
    },
    "fsb": {
        "budget_consomme": 2.8,
        "taux_execution_budgetaire": 2.8,
        "taux_de_reussite": 1.9,
        "taux_de_presence": 1.4,
        "taux_d_abandon": -1.1,
        "taux_absenteisme_rh": -0.9,
        "effectif_enseignant": 3.0,
    },
}


KPI_DOMAINS = {
    "taux_de_reussite": "academic",
    "taux_de_presence": "academic",
    "taux_d_abandon": "academic",
    "budget_consomme": "finance",
    "taux_execution_budgetaire": "finance",
    "taux_absenteisme_rh": "hr",
    "effectif_enseignant": "hr",
}


def _round_2(value: float) -> float:
    return round(value, 2)


def _get_months() -> list[str]:
    now = datetime.utcnow()
    return [(now - timedelta(days=30 * i)).strftime("%Y-%m") for i in range(2, -1, -1)]


def _generate_value(base: float, month_index: int, trend: float) -> float:
    if trend == 0.0:
        variation = copysign(0.3, (month_index % 2) - 0.5)
        return _round_2(base + variation)
    trend_change = trend * month_index
    noise = ((month_index * 7) % 5 - 2) * 0.2
    return _round_2(base + trend_change + noise)


async def seed_institutions(conn):
    """Insert or update institution records."""
    print("\nSeeding institutions...")
    for inst in INSTITUTIONS:
        try:
            await conn.execute("""
                INSERT INTO dim_institution (code, name, city, institution_type)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    city = EXCLUDED.city,
                    institution_type = EXCLUDED.institution_type
            """, inst["code"], inst["name"], inst["city"], inst["institution_type"])
            print(f"  ✓ {inst['name']}")
        except Exception as e:
            print(f"  ✗ {inst['name']}: {e}")
    print("Done seeding institutions.")


async def seed_kpis(conn):
    """Insert KPI snapshots for all institutions and months."""
    print("\nSeeding KPI snapshots...")
    months = _get_months()
    total_inserted = 0

    # Get institution IDs
    inst_rows = await conn.fetch("SELECT id, code FROM dim_institution")
    inst_map = {row["code"]: row["id"] for row in inst_rows}

    for inst_code, inst_id in inst_map.items():
        base = BASE_KPIS[inst_code]
        trends = TRENDS[inst_code]

        for month_idx, period in enumerate(months):
            for kpi_key, base_value in base.items():
                trend = trends.get(kpi_key, 0.0)
                value = _generate_value(base_value, month_idx, trend)

                try:
                    await conn.execute("""
                        INSERT INTO fact_kpi (institution_id, kpi_key, value, period)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (institution_id, kpi_key, period) DO UPDATE SET
                            value = EXCLUDED.value
                    """, inst_id, kpi_key, value, period)
                    total_inserted += 1
                except Exception as e:
                    print(f"  Error: {e}")

    print(f"  Inserted {total_inserted} KPI records")
    print("Done seeding KPIs.")


async def main():
    print("=" * 50)
    print("CARTHAGE Seed Script")
    print("=" * 50)

    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set in .env")
        return

    raw_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    try:
        conn = await asyncpg.connect(raw_url)
    except Exception as e:
        print(f"ERROR: Could not connect: {e}")
        return

    await seed_institutions(conn)
    await seed_kpis(conn)

    await conn.close()

    print("\n" + "=" * 50)
    print("Seed complete!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())