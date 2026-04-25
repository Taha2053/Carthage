"""
UCAR Intelligence Hub — Data Ingestion Service
Handles Excel/CSV upload → parse → validate → store in fact tables.
Uses Supabase SDK (async).
"""

from __future__ import annotations

import hashlib
import io
import logging
import time
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
from supabase._async.client import AsyncClient

logger = logging.getLogger(__name__)

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
    """Normalize column name for matching."""
    return col.strip().lower().replace(" ", "_").replace("-", "_")


def _detect_columns(df: pd.DataFrame) -> Dict[str, str]:
    """Auto-detect Excel columns mapping to our fields."""
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
    """Handles file ingestion using Supabase SDK."""

    async def parse_file(
        self, db: AsyncClient,
        file_content: bytes,
        filename: str,
    ) -> Tuple[pd.DataFrame, Dict[str, str], List[Dict]]:
        """Parse Excel/CSV file and detect columns."""
        warnings: List[Dict] = []
        
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                df = pd.read_excel(io.BytesIO(file_content), engine="openpyxl")
        except Exception as e:
            raise ValueError(f"Failed to parse file: {e}")
        
        if df.empty:
            raise ValueError("File is empty")
        
        col_mapping = _detect_columns(df)
        
        if "metric_code" not in col_mapping:
            warnings.append({
                "type": "missing_column",
                "message": f"Could not detect metric column. Available: {list(df.columns)}",
            })
        
        if "value" not in col_mapping:
            warnings.append({
                "type": "missing_column",
                "message": "Could not detect value column",
            })
        
        logger.info(f"📊 Parsed {filename}: {len(df)} rows")
        return df, col_mapping, warnings

    async def validate_data(
        self, db: AsyncClient,
        df: pd.DataFrame,
        col_mapping: Dict[str, str],
    ) -> Tuple[List[Dict], List[Dict], List[Dict]]:
        """Validate data against DB."""
        valid_rows: List[Dict] = []
        invalid_rows: List[Dict] = []
        errors: List[Dict] = []
        
        # Get valid metrics (case insensitive)
        metric_result = await db.table("dim_metric").select("code").execute()
        valid_metrics = {r["code"].lower() for r in metric_result.data}
        
        # Get valid institutions (case insensitive)
        inst_result = await db.table("dim_institution").select("code").execute()
        valid_institutions = {r["code"].upper() for r in inst_result.data}
        
        metric_col = col_mapping.get("metric_code")
        value_col = col_mapping.get("value")
        inst_col = col_mapping.get("institution_code")
        
        for idx, row in df.iterrows():
            row_errors = []
            row_dict = row.to_dict()
            
            # Validate metric
            if metric_col:
                code = str(row.get(metric_col, "")).strip().lower()
                if code and code not in valid_metrics:
                    row_errors.append(f"Unknown metric: {code}")
            
            # Validate value
            if value_col:
                val = row.get(value_col)
                try:
                    float_val = float(val)
                    if "RATE" in str(row.get(metric_col, "")).upper() and float_val > 100:
                        row_errors.append(f"Rate exceeds 100%: {float_val}")
                except (ValueError, TypeError):
                    if val is not None and str(val).strip():
                        row_errors.append(f"Invalid value: {val}")
            
            # Validate institution
            if inst_col:
                code = str(row.get(inst_col, "")).strip().upper()
                if code and code not in valid_institutions:
                    row_errors.append(f"Unknown institution: {code}")
            
            if row_errors:
                invalid_rows.append({"row": idx + 2, "data": row_dict, "errors": row_errors})
                errors.extend([{"row": idx + 2, "error": e} for e in row_errors])
            else:
                valid_rows.append(row_dict)
        
        logger.info(f"✅ Validation: {len(valid_rows)} valid, {len(invalid_rows)} invalid")
        return valid_rows, invalid_rows, errors

    async def ingest(
        self, db: AsyncClient,
        file_content: bytes,
        filename: str,
        institution_id: int,
        domain_code: str = "STU",
        uploaded_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Full ingestion pipeline: parse → validate → dedup → insert."""
        start_time = time.time()
        
        # 1. Deduplication
        file_hash = _compute_file_hash(file_content)
        dup_check = await db.table("upload_log").select("id").eq("file_hash", file_hash).eq("institution_id", institution_id).execute()
        if dup_check.data:
            return {
                "status": "duplicate",
                "is_duplicate": True,
                "message": "File already uploaded",
                "rows_parsed": 0,
                "rows_inserted": 0,
                "rows_failed": 0,
            }
        
        # 2. Parse
        df, col_mapping, parse_warnings = await self.parse_file(db, file_content, filename)
        
        # 3. Validate
        valid_rows, invalid_rows, validation_errors = await self.validate_data(db, df, col_mapping)
        
        # 4. Insert valid rows
        rows_inserted = 0
        metric_col = col_mapping.get("metric_code")
        value_col = col_mapping.get("value")
        ay_col = col_mapping.get("academic_year")
        sem_col = col_mapping.get("semester")
        prev_col = col_mapping.get("value_previous")
        
        for row_data in valid_rows:
            try:
                # Get metric ID
                metric_code = str(row_data.get(metric_col, "")).strip().lower() if metric_col else None
                if not metric_code:
                    continue
                
                metric_result = await db.table("dim_metric").select("id").eq("code", metric_code).execute()
                if not metric_result.data:
                    continue
                metric_id = metric_result.data[0]["id"]
                
                # Get time ID
                time_id = await self._resolve_time_id(
                    db,
                    ay=str(row_data.get(ay_col, "")) if ay_col else None,
                    semester=row_data.get(sem_col) if sem_col else None,
                )
                if not time_id:
                    continue
                
                # Build KPI fact
                value = float(row_data[value_col]) if value_col and row_data.get(value_col) else 0
                value_previous = None
                if prev_col and row_data.get(prev_col) is not None:
                    try:
                        value_previous = float(row_data[prev_col])
                    except (ValueError, TypeError):
                        pass
                
                kpi_data = {
                    "institution_id": institution_id,
                    "metric_id": metric_id,
                    "time_id": time_id,
                    "value": value,
                    "value_previous": value_previous,
                    "source": "file_upload",
                }
                
                await db.table("fact_kpis").insert(kpi_data).execute()
                rows_inserted += 1
                
            except Exception as e:
                logger.error(f"Row insert error: {e}")
                validation_errors.append({"row": "batch", "error": str(e)})
        
        # 5. Compute quality score
        total = len(valid_rows) + len(invalid_rows)
        quality_score = round((len(valid_rows) / max(total, 1)) * 100, 2)
        
        # 6. Log upload
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        upload_log = {
            "institution_id": institution_id,
            "domain_code": domain_code,
            "filename": filename,
            "file_size_bytes": len(file_content),
            "file_hash": file_hash,
            "rows_parsed": total,
            "rows_inserted": rows_inserted,
            "rows_failed": len(invalid_rows),
            "status": "completed" if rows_inserted > 0 else "failed",
            "data_quality_score": quality_score,
            "uploaded_by": uploaded_by,
            "processing_ms": elapsed_ms,
        }
        
        await db.table("upload_log").insert(upload_log).execute()
        
        logger.info(f"✅ Ingestion: {rows_inserted} inserted, quality={quality_score}%")
        
        return {
            "status": "completed",
            "is_duplicate": False,
            "rows_parsed": total,
            "rows_inserted": rows_inserted,
            "rows_failed": len(invalid_rows),
            "data_quality_score": quality_score,
            "validation_errors": validation_errors[:50],
            "processing_ms": elapsed_ms,
            "message": f"Successfully ingested {rows_inserted} rows",
        }

    async def _resolve_time_id(
        self, db: AsyncClient,
        ay: Optional[str] = None,
        semester: Optional[int] = None,
    ) -> Optional[int]:
        """Resolve time_id from academic year + semester."""
        if ay and semester:
            result = await db.table("dim_time").select("id").eq("academic_year", ay).eq("semester", int(semester)).limit(1).execute()
            if result.data:
                return result.data[0]["id"]
        
        # Fallback to any entry
        result = await db.table("dim_time").select("id").limit(1).execute()
        return result.data[0]["id"] if result.data else None


# Singleton
ingestion_service = IngestionService()