"""
KPI Computation Engine for CARTHAGE.

Pure functions to compute KPIs from raw data rows.
All functions are stateless and have no DB or API dependencies.
"""

from typing import Any


def compute_kpis(raw_rows: list[dict], institution_id: str) -> dict[str, dict[str, Any]]:
    """
    Compute all KPIs from raw data rows.

    Args:
        raw_rows: List of dictionaries where each dict represents one record/row
                 Common keys expected:
                 - passed, total_students (for academic KPIs)
                 - dropped, total_enrolled (for dropout)
                 - present_days, total_days (for presence)
                 - consumed, allocated (for budget)
                 - absent_days, total_staff_days (for HR)
                 - is_teacher: bool (for staff count)
        institution_id: The institution identifier

    Returns:
        Dict mapping kpi_key to {"value": float, "domain": str}
    """
    if not raw_rows:
        return _empty_kpis()

    result = {}

    # Academic KPIs
    result["taux_de_reussite"] = _compute_taux_de_reussite(raw_rows)
    result["taux_d_abandon"] = _compute_taux_d_abandon(raw_rows)
    result["taux_de_presence"] = _compute_taux_de_presence(raw_rows)

    # Finance KPIs
    result["budget_consomme"] = _compute_budget_consomme(raw_rows)
    result["taux_execution_budgetaire"] = result["budget_consomme"]["value"]

    # HR KPIs
    result["taux_absenteisme_rh"] = _compute_taux_absenteisme_rh(raw_rows)
    result["effectif_enseignant"] = _compute_effectif_enseignant(raw_rows)

    return result


def _empty_kpis() -> dict[str, dict[str, Any]]:
    """Return empty KPI structure."""
    return {
        "taux_de_reussite": {"value": 0.0, "domain": "academic"},
        "taux_d_abandon": {"value": 0.0, "domain": "academic"},
        "taux_de_presence": {"value": 0.0, "domain": "academic"},
        "budget_consomme": {"value": 0.0, "domain": "finance"},
        "taux_execution_budgetaire": {"value": 0.0, "domain": "finance"},
        "taux_absenteisme_rh": {"value": 0.0, "domain": "hr"},
        "effectif_enseignant": {"value": 0.0, "domain": "hr"},
    }


def _safe_divide(numerator: float, denominator: float) -> float:
    """Safely divide, returning 0.0 if denominator is 0 or None."""
    if denominator is None or denominator == 0:
        return 0.0
    return numerator / denominator


def _round_2(value: float) -> float:
    """Round to 2 decimal places."""
    return round(value, 2)


def _get_float(row: dict, *keys: str) -> float:
    """Get float value from row, trying multiple keys."""
    for key in keys:
        val = row.get(key)
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                pass
    return 0.0


def _compute_taux_de_reussite(raw_rows: list[dict]) -> dict[str, Any]:
    """Compute success rate: passed / total_students * 100"""
    total = 0
    passed = 0

    for row in raw_rows:
        total += _get_float(row, "total_students", "total", "nb_etudiants")
        passed += _get_float(row, "passed", "admis", "reussis")

    value = _round_2(_safe_divide(passed, total) * 100)
    return {"value": value, "domain": "academic"}


def _compute_taux_d_abandon(raw_rows: list[dict]) -> dict[str, Any]:
    """Compute dropout rate: dropped / total_enrolled * 100"""
    total = 0
    dropped = 0

    for row in raw_rows:
        total += _get_float(row, "total_enrolled", "total", "inscrits")
        dropped += _get_float(row, "dropped", "abandon", "desabornis")

    value = _round_2(_safe_divide(dropped, total) * 100)
    return {"value": value, "domain": "academic"}


def _compute_taux_de_presence(raw_rows: list[dict]) -> dict[str, Any]:
    """Compute attendance rate: present_days / total_days * 100"""
    total_days = 0
    present_days = 0

    for row in raw_rows:
        total_days += _get_float(row, "total_days", "jours_total", "jours")
        present_days += _get_float(row, "present_days", "presents", "presence")

    value = _round_2(_safe_divide(present_days, total_days) * 100)
    return {"value": value, "domain": "academic"}


def _compute_budget_consomme(raw_rows: list[dict]) -> dict[str, Any]:
    """Compute budget consumption: consumed / allocated * 100"""
    allocated = 0
    consumed = 0

    for row in raw_rows:
        allocated += _get_float(row, "allocated", "alloue", "budget_alloue", "budget")
        consumed += _get_float(row, "consumed", "consomme", "depense", "budget_consomme")

    value = _round_2(_safe_divide(consumed, allocated) * 100)
    return {"value": value, "domain": "finance"}


def _compute_taux_absenteisme_rh(raw_rows: list[dict]) -> dict[str, Any]:
    """Compute HR absenteeism: absent_days / total_staff_days * 100"""
    total_days = 0
    absent_days = 0

    for row in raw_rows:
        total_days += _get_float(row, "total_staff_days", "jours_total_personnel")
        absent_days += _get_float(row, "absent_days", "absences", "jours_absence")

    value = _round_2(_safe_divide(absent_days, total_days) * 100)
    return {"value": value, "domain": "hr"}


def _compute_effectif_enseignant(raw_rows: list[dict]) -> dict[str, Any]:
    """Compute teaching staff count: count rows where is_teacher is True."""
    count = 0

    for row in raw_rows:
        is_teacher = row.get("is_teacher")
        if is_teacher is True or str(is_teacher).lower() == "true":
            count += 1
        # Also check if role indicates teaching staff
        role = row.get("role", "").lower()
        if "enseignant" in role or "prof" in role or "teacher" in role:
            count += 1

    return {"value": float(count), "domain": "hr"}


# Alias for backward compatibility
compute_taux_de_reussite = _compute_taux_de_reussite
compute_taux_d_abandon = _compute_taux_d_abandon
compute_taux_de_presence = _compute_taux_de_presence
compute_budget_consomme = _compute_budget_consomme
compute_taux_absenteisme_rh = _compute_taux_absenteisme_rh
compute_effectif_enseignant = _compute_effectif_enseignant