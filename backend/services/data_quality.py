"""
UCAR Intelligence Hub — Data Quality Service
Validation, consistency checking, anomaly detection, quality scoring.
"""

from __future__ import annotations

import logging
import math
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from models.fact_kpi import FactKPI
from models.institution import Institution
from models.metric import Metric
from models.domain import Domain

logger = logging.getLogger(__name__)


class DataQualityService:
    """Validates data quality and detects anomalies."""

    async def compute_institution_scores(
        self, db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Compute data quality scores for all institutions."""
        result = await db.execute(select(Institution).where(Institution.is_active == True))
        institutions = result.scalars().all()

        scores = []
        for inst in institutions:
            score = await self._compute_score(db, inst.id)
            grade = self._score_to_grade(score["overall_score"])
            scores.append({
                "institution_id": inst.id,
                "institution_name": inst.name,
                "institution_code": inst.code,
                **score,
                "grade": grade,
            })

        scores.sort(key=lambda x: x["overall_score"], reverse=True)
        return scores

    async def _compute_score(self, db: AsyncSession, institution_id: int) -> Dict[str, float]:
        """
        Score = 0.4 × completeness + 0.3 × consistency + 0.2 × timeliness + 0.1 × accuracy
        """
        # Completeness: % of metrics that have data
        total_metrics = await db.execute(select(func.count(Metric.id)).where(Metric.is_active == True))
        total_m = total_metrics.scalar() or 1

        filled_metrics = await db.execute(
            select(func.count(func.distinct(FactKPI.metric_id)))
            .where(FactKPI.institution_id == institution_id)
        )
        filled_m = filled_metrics.scalar() or 0
        completeness = min((filled_m / total_m) * 100, 100)

        # Consistency: % of values within expected thresholds
        total_facts = await db.execute(
            select(func.count(FactKPI.id)).where(FactKPI.institution_id == institution_id)
        )
        total_f = total_facts.scalar() or 1

        # Count values that breach thresholds
        breach_query = text("""
            SELECT COUNT(*) FROM fact_kpis f
            JOIN dim_metric m ON f.metric_id = m.id
            WHERE f.institution_id = :inst_id
            AND (
                (m.higher_is_better AND m.critical_threshold IS NOT NULL AND f.value < m.critical_threshold)
                OR (NOT m.higher_is_better AND m.critical_threshold IS NOT NULL AND f.value > m.critical_threshold)
            )
        """)
        breach_result = await db.execute(breach_query, {"inst_id": institution_id})
        breaches = breach_result.scalar() or 0
        consistency = max((1 - breaches / total_f) * 100, 0)

        # Timeliness: how recent is the data (based on latest time_id)
        latest = await db.execute(
            select(func.max(FactKPI.time_id)).where(FactKPI.institution_id == institution_id)
        )
        max_time = await db.execute(select(func.max(FactKPI.time_id)))
        latest_val = latest.scalar() or 0
        max_val = max_time.scalar() or 1
        timeliness = min((latest_val / max(max_val, 1)) * 100, 100)

        # Accuracy: % of non-null values
        non_null = await db.execute(
            select(func.count(FactKPI.id))
            .where(FactKPI.institution_id == institution_id, FactKPI.value.isnot(None))
        )
        accuracy = min((non_null.scalar() or 0) / max(total_f, 1) * 100, 100)

        overall = (0.4 * completeness + 0.3 * consistency + 0.2 * timeliness + 0.1 * accuracy)

        return {
            "overall_score": round(overall, 2),
            "completeness": round(completeness, 2),
            "consistency": round(consistency, 2),
            "timeliness": round(timeliness, 2),
            "accuracy": round(accuracy, 2),
        }

    def _score_to_grade(self, score: float) -> str:
        if score >= 90: return "A"
        if score >= 75: return "B"
        if score >= 60: return "C"
        if score >= 40: return "D"
        return "F"

    async def detect_anomalies(
        self, db: AsyncSession, institution_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Detect statistical anomalies using Z-score method."""
        query = text("""
            SELECT 
                f.institution_id,
                i.name as institution_name,
                m.code as metric_code,
                m.name as metric_name,
                f.value,
                m.higher_is_better,
                sub.avg_val,
                sub.stddev_val
            FROM fact_kpis f
            JOIN dim_institution i ON f.institution_id = i.id
            JOIN dim_metric m ON f.metric_id = m.id
            JOIN (
                SELECT metric_id, 
                       AVG(value) as avg_val, 
                       STDDEV(value) as stddev_val
                FROM fact_kpis 
                WHERE department_id IS NULL
                GROUP BY metric_id
                HAVING STDDEV(value) > 0
            ) sub ON f.metric_id = sub.metric_id
            WHERE f.department_id IS NULL
            AND ABS(f.value - sub.avg_val) > 2 * sub.stddev_val
        """ + (" AND f.institution_id = :inst_id" if institution_id else ""))

        params = {"inst_id": institution_id} if institution_id else {}
        result = await db.execute(query, params)
        rows = result.mappings().all()

        anomalies = []
        for r in rows:
            avg = float(r["avg_val"])
            std = float(r["stddev_val"]) if r["stddev_val"] else 1
            val = float(r["value"])
            deviation = abs(val - avg) / std

            anomaly_type = "spike" if val > avg else "drop"
            expected_low = round(avg - 2 * std, 2)
            expected_high = round(avg + 2 * std, 2)

            anomalies.append({
                "institution_id": r["institution_id"],
                "institution_name": r["institution_name"],
                "metric_code": r["metric_code"],
                "metric_name": r["metric_name"],
                "value": val,
                "expected_range": f"{expected_low} - {expected_high}",
                "deviation": round(deviation, 2),
                "anomaly_type": anomaly_type,
                "explanation": None,  # Teammate's AI agent fills this
                "suggestion": None,
            })

        anomalies.sort(key=lambda x: x["deviation"], reverse=True)
        return anomalies


# Singleton
data_quality_service = DataQualityService()
