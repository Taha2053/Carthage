"""
Seed script for CARTHAGE.

Inserts 5 institutions with 3 months of KPI data each.
Run with: uv run python services/seed.py
"""

from datetime import datetime, timedelta
from math import copysign

from core.database import supabase


# Institution definitions
INSTITUTIONS = [
    {
        "id": "supcom",
        "name": "Sup'Com",
        "city": "Tunis",
        "type": "Grande École",
    },
    {
        "id": "ept",
        "name": "Ecole Polytechnique de Tunisie",
        "city": "La Marsa",
        "type": "Grande École",
    },
    {
        "id": "ihec",
        "name": "Institut des Hautes Etudes Commerciales de Carthage",
        "city": "Carthage",
        "type": "Institut",
    },
    {
        "id": "insat",
        "name": "Institut National des Sciences Appliquées et de Technologie",
        "city": "Tunis",
        "type": "Institut",
    },
    {
        "id": "fsb",
        "name": "Faculté des Sciences de Bizerte",
        "city": "Bizerte",
        "type": "Faculté",
    },
]


# Base KPI values per institution (first month)
# Format: { institution_id: { kpi_key: base_value } }
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

# Trend behavior: how values change each month
# Positive = improving, Negative = worsening
TRENDS = {
    "supcom": {
        # Budget RISK - budget_consomme increases toward 100%
        "budget_consomme": 3.5,
        "taux_execution_budgetaire": 3.5,
        # Other values: minor natural variation
        "taux_de_reussite": -0.5,
        "taux_de_presence": -0.3,
        "taux_d_abandon": 0.4,
        "taux_absenteisme_rh": 0.2,
        "effectif_enseignant": 0.0,  # Staff count stays stable
    },
    "ept": {
        # STRONG - consistently high with minor natural variation
        "budget_consomme": 0.8,
        "taux_execution_budgetaire": 0.8,
        "taux_de_reussite": 0.4,
        "taux_de_presence": 0.2,
        "taux_d_abandon": -0.3,
        "taux_absenteisme_rh": -0.2,
        "effectif_enseignant": 1.0,  # Slight growth
    },
    "ihec": {
        # STRUGGLING - values get worse each month
        "budget_consomme": -1.2,
        "taux_execution_budgetaire": -1.2,
        "taux_de_reussite": -2.1,
        "taux_de_presence": -1.8,
        "taux_d_abandon": 1.5,
        "taux_absenteisme_rh": 1.1,
        "effectif_enseignant": -2.0,
    },
    "insat": {
        # BALANCED - slight fluctuation, no clear trend
        "budget_consomme": 1.5,
        "taux_execution_budgetaire": 1.5,
        "taux_de_reussite": -0.8,
        "taux_de_presence": 0.5,
        "taux_d_abandon": 0.6,
        "taux_absenteisme_rh": -0.4,
        "effectif_enseignant": 2.0,
    },
    "fsb": {
        # RECOVERING - values improve each month
        "budget_consomme": 2.8,
        "taux_execution_budgetaire": 2.8,
        "taux_de_reussite": 1.9,
        "taux_de_presence": 1.4,
        "taux_d_abandon": -1.1,
        "taux_absenteisme_rh": -0.9,
        "effectif_enseignant": 3.0,
    },
}


# KPI to domain mapping
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
    """Round to 2 decimal places."""
    return round(value, 2)


def _get_months() -> list[str]:
    """Get last 3 months as YYYY-MM strings."""
    now = datetime.utcnow()
    months = []
    for i in range(2, -1, -1):  # 2 months back, 1 month back, current
        d = now - timedelta(days=30 * i)
        months.append(d.strftime("%Y-%m"))
    return months


def _generate_value(base: float, month_index: int, trend: float) -> float:
    """Generate value with trend variation.

    month_index: 0 = oldest, 1 = middle, 2 = current
    """
    if trend == 0.0:
        # Add tiny random variation (±0.3) for "never flat"
        variation = copysign(0.3, (month_index % 2) - 0.5)
        return _round_2(base + variation)

    # Apply trend with some noise
    trend_change = trend * month_index
    noise = ((month_index * 7) % 5 - 2) * 0.2  # Small noise
    return _round_2(base + trend_change + noise)


def seed_institutions():
    """Insert or update institution records."""
    print("Seeding institutions...")

    for inst in INSTITUTIONS:
        try:
            response = supabase.table("institutions").upsert(
                inst,
                on_conflict="id"
            ).execute()

            if response.data:
                print(f"  ✓ {inst['name']}")
            else:
                print(f"  ✗ {inst['name']}: {response}")
        except Exception as e:
            print(f"  ✗ {inst['name']}: {e}")

    print("Done seeding institutions.")


def seed_kpis():
    """Insert KPI snapshots for all institutions and months."""
    print("\nSeeding KPI snapshots...")

    months = _get_months()
    total_inserted = 0

    for inst in INSTITUTIONS:
        inst_id = inst["id"]
        base = BASE_KPIS[inst_id]
        trends = TRENDS[inst_id]

        for month_idx, period in enumerate(months):
            for kpi_key, base_value in base.items():
                trend = trends.get(kpi_key, 0.0)
                value = _generate_value(base_value, month_idx, trend)

                record = {
                    "institution_id": inst_id,
                    "domain": KPI_DOMAINS[kpi_key],
                    "kpi_key": kpi_key,
                    "value": value,
                    "period": period,
                    "recorded_at": datetime.utcnow().isoformat(),
                }

                try:
                    response = supabase.table("kpi_snapshots").upsert(
                        record,
                        on_conflict="institution_id,kpi_key,period"
                    ).execute()

                    if response.data:
                        total_inserted += 1
                except Exception as e:
                    print(f"  Error inserting {inst_id}/{kpi_key}/{period}: {e}")

    print(f"  Inserted {total_inserted} KPI records")
    print("Done seeding KPIs.")


def main():
    """Main entry point."""
    print("=" * 50)
    print("CARTHAGE Seed Script")
    print("=" * 50)

    # Seed institutions first
    seed_institutions()

    # Then seed KPIs
    seed_kpis()

    print("\n" + "=" * 50)
    print("Seed complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()