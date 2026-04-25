"""
UCAR Intelligence Hub — Data Ingestion Service
Handles Excel upload → parse → validate → insert into fact_kpis.
"""

from __future__ import annotations

import hashlib
import io
import logging
import time
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from models.fact_kpi import FactKPI
from models.institution import Institution
from models.metric import Metric
from models.time_dim import TimeDimension
from models.upload_log import UploadLog

logger = logging.getLogger(__name__)

# ── Column mapping: expected Excel headers → DB fields ───────
EXPECTED_COLUMNS = {
    "metric_code": ["metric_code", "metric", "kpi_code", "indicator", "code_indicateur"],
    "value": ["value", "valeur", "val", "score"],
    "institution_code": ["institution_code", "institution", "etablissement", "inst_code"],
    "department_code": ["department_code", "department", "departement", "dept_code"],
    "date": ["date", "full_date", "period", "periode"],
    "academic_year": ["academic_year", "annee_academique", "year"],
    "semester": ["semester", "semestre", "sem"],
    "value_previous": ["value_previous", "valeur_precedente", "prev_value"],
}


def _normalize_column(col: str) -> str:
    """Normalize a column name for matching."""
    return col.strip().lower().replace(" ", "_").replace("-", "_")


def _detect_columns(df: pd.DataFrame) -> Dict[str, str]:
    """
    Auto-detect which Excel columns map to our expected fields.
    Returns: {our_field: excel_column_name}
    """
    mapping = {}
    normalized = {_normalize_column(c): c for c in df.columns}

    for field, aliases in EXPECTED_COLUMNS.items():
        for alias in aliases:
            if alias in normalized:
                mapping[field] = normalized[alias]
                break
    return mapping


def _compute_file_hash(content: bytes) -> str:
    """SHA-256 hash for deduplication."""
    return hashlib.sha256(content).hexdigest()


class IngestionService:
    """Handles Excel file ingestion into the UCAR data warehouse."""

    async def parse_excel(
        self, file_content: bytes, filename: str
    ) -> Tuple[pd.DataFrame, Dict[str, str], List[Dict]]:
        """
        Parse an Excel file and detect column mapping.
        Returns: (dataframe, column_mapping, warnings)
        """
        warnings: List[Dict] = []

        try:
            df = pd.read_excel(io.BytesIO(file_content), engine="openpyxl")
        except Exception as e:
            raise ValueError(f"Failed to parse Excel file: {e}")

        if df.empty:
            raise ValueError("Excel file is empty")

        # Detect columns
        col_mapping = _detect_columns(df)

        if "metric_code" not in col_mapping:
            warnings.append({
                "type": "missing_column",
                "message": "Could not detect 'metric_code' column. Available columns: " + ", ".join(df.columns.tolist()),
            })

        if "value" not in col_mapping:
            warnings.append({
                "type": "missing_column",
                "message": "Could not detect 'value' column.",
            })

        logger.info(f"📊 Parsed {filename}: {len(df)} rows, {len(df.columns)} columns")
        logger.info(f"📋 Column mapping: {col_mapping}")

        return df, col_mapping, warnings

    async def validate_data(
        self, df: pd.DataFrame, col_mapping: Dict[str, str], db: AsyncSession
    ) -> Tuple[List[Dict], List[Dict], List[Dict]]:
        """
        Validate parsed data against DB constraints.
        Returns: (valid_rows, invalid_rows, errors)
        """
        valid_rows: List[Dict] = []
        invalid_rows: List[Dict] = []
        errors: List[Dict] = []

        # Load valid metric codes
        result = await db.execute(select(Metric.code))
        valid_metrics = {r[0] for r in result.all()}

        # Load valid institution codes
        result = await db.execute(select(Institution.code))
        valid_institutions = {r[0] for r in result.all()}

        metric_col = col_mapping.get("metric_code")
        value_col = col_mapping.get("value")
        inst_col = col_mapping.get("institution_code")

        for idx, row in df.iterrows():
            row_errors = []
            row_dict = row.to_dict()

            # Validate metric code
            if metric_col:
                metric_code = str(row.get(metric_col, "")).strip().upper()
                if metric_code and metric_code not in valid_metrics:
                    row_errors.append(f"Unknown metric: {metric_code}")

            # Validate value
            if value_col:
                val = row.get(value_col)
                try:
                    float_val = float(val)
                    if float_val < 0 and metric_col:
                        mc = str(row.get(metric_col, "")).strip().upper()
                        if "RATE" in mc and float_val < 0:
                            row_errors.append(f"Negative rate value: {float_val}")
                    if "RATE" in str(row.get(metric_col, "")).upper() and float_val > 100:
                        row_errors.append(f"Rate value exceeds 100%: {float_val}")
                except (ValueError, TypeError):
                    row_errors.append(f"Invalid numeric value: {val}")

            # Validate institution
            if inst_col:
                inst_code = str(row.get(inst_col, "")).strip().upper()
                if inst_code and inst_code not in valid_institutions:
                    row_errors.append(f"Unknown institution: {inst_code}")

            if row_errors:
                invalid_rows.append({"row": idx + 2, "data": row_dict, "errors": row_errors})
                errors.extend([{"row": idx + 2, "error": e} for e in row_errors])
            else:
                valid_rows.append(row_dict)

        logger.info(f"✅ Validation: {len(valid_rows)} valid, {len(invalid_rows)} invalid")
        return valid_rows, invalid_rows, errors

    async def ingest(
        self,
        file_content: bytes,
        filename: str,
        institution_id: int,
        db: AsyncSession,
        uploaded_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Full ingestion pipeline: parse → validate → dedup check → insert.
        Returns upload result dict.
        """
        start_time = time.time()

        # 1. Deduplication check
        file_hash = _compute_file_hash(file_content)
        existing = await db.execute(
            select(UploadLog).where(
                UploadLog.file_hash == file_hash,
                UploadLog.institution_id == institution_id,
            )
        )
        if existing.scalar_one_or_none():
            return {
                "status": "duplicate",
                "is_duplicate": True,
                "message": "This file has already been uploaded for this institution.",
                "rows_parsed": 0,
                "rows_inserted": 0,
                "rows_failed": 0,
            }

        # 2. Parse
        df, col_mapping, parse_warnings = await self.parse_excel(file_content, filename)

        # 3. Validate
        valid_rows, invalid_rows, validation_errors = await self.validate_data(
            df, col_mapping, db
        )

        # 4. Insert valid rows into fact_kpis
        rows_inserted = 0
        metric_col = col_mapping.get("metric_code")
        value_col = col_mapping.get("value")
        date_col = col_mapping.get("date")
        ay_col = col_mapping.get("academic_year")
        sem_col = col_mapping.get("semester")
        prev_col = col_mapping.get("value_previous")

        for row_data in valid_rows:
            try:
                # Resolve metric_id
                metric_code = str(row_data.get(metric_col, "")).strip().upper() if metric_col else None
                if not metric_code:
                    continue
                
                result = await db.execute(
                    select(Metric.id).where(Metric.code == metric_code)
                )
                metric_id = result.scalar_one_or_none()
                if not metric_id:
                    continue

                # Resolve time_id
                time_id = await self._resolve_time_id(
                    db,
                    date_str=str(row_data.get(date_col, "")) if date_col else None,
                    academic_year=str(row_data.get(ay_col, "")) if ay_col else None,
                    semester=row_data.get(sem_col) if sem_col else None,
                )
                if not time_id:
                    continue

                # Build KPI fact
                value = float(row_data[value_col]) if value_col else 0
                value_previous = None
                if prev_col and row_data.get(prev_col) is not None:
                    try:
                        value_previous = float(row_data[prev_col])
                    except (ValueError, TypeError):
                        pass

                kpi = FactKPI(
                    institution_id=institution_id,
                    metric_id=metric_id,
                    time_id=time_id,
                    value=value,
                    value_previous=value_previous,
                    source="excel_upload",
                )
                db.add(kpi)
                rows_inserted += 1

            except Exception as e:
                logger.error(f"Row insert error: {e}")
                validation_errors.append({"row": "batch", "error": str(e)})

        # 5. Flush to DB
        await db.flush()

        # 6. Compute quality score
        total = len(valid_rows) + len(invalid_rows)
        quality_score = round((len(valid_rows) / max(total, 1)) * 100, 2)

        # 7. Log the upload
        elapsed_ms = int((time.time() - start_time) * 1000)
        upload_log = UploadLog(
            institution_id=institution_id,
            filename=filename,
            file_size_bytes=len(file_content),
            file_hash=file_hash,
            rows_parsed=total,
            rows_inserted=rows_inserted,
            rows_failed=len(invalid_rows),
            status="completed",
            data_quality_score=quality_score,
            uploaded_by=uploaded_by,
            processing_ms=elapsed_ms,
            is_duplicate=False,
            storage_tier="hot",
        )
        db.add(upload_log)
        await db.flush()

        logger.info(
            f"✅ Ingestion complete: {rows_inserted} inserted, "
            f"{len(invalid_rows)} failed, quality={quality_score}%"
        )

        return {
            "upload_id": upload_log.id,
            "status": "completed",
            "is_duplicate": False,
            "rows_parsed": total,
            "rows_inserted": rows_inserted,
            "rows_failed": len(invalid_rows),
            "data_quality_score": quality_score,
            "validation_errors": validation_errors[:50],  # cap at 50
            "processing_ms": elapsed_ms,
            "message": f"Successfully ingested {rows_inserted} rows.",
        }

    async def _resolve_time_id(
        self,
        db: AsyncSession,
        date_str: Optional[str] = None,
        academic_year: Optional[str] = None,
        semester: Optional[int] = None,
    ) -> Optional[int]:
        """Resolve a time_id from date or academic_year + semester."""
        if date_str and date_str.strip():
            try:
                result = await db.execute(
                    select(TimeDimension.id).where(
                        TimeDimension.full_date == date_str.strip()
                    )
                )
                tid = result.scalar_one_or_none()
                if tid:
                    return tid
            except Exception:
                pass

        if academic_year and semester:
            try:
                result = await db.execute(
                    select(TimeDimension.id)
                    .where(
                        TimeDimension.academic_year == str(academic_year).strip(),
                        TimeDimension.semester == int(semester),
                    )
                    .limit(1)
                )
                tid = result.scalar_one_or_none()
                if tid:
                    return tid
            except Exception:
                pass

        # Fallback: latest time entry
        result = await db.execute(
            select(TimeDimension.id).order_by(TimeDimension.id.desc()).limit(1)
        )
        return result.scalar_one_or_none()


# Singleton
ingestion_service = IngestionService()
