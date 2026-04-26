"""
Ingest API for file uploads.

Handles CSV and Excel file uploads, parses with pandas,
computes KPIs, and upserts to Supabase.
"""

from datetime import datetime
from io import BytesIO

import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Header
from fastapi.responses import JSONResponse

from core.database import supabase
from services.kpi_engine import compute_kpis


router = APIRouter(prefix="/ingest", tags=["ingest"])


ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def _verify_auth(authorization: str) -> bool:
    """Verify Bearer token with Supabase auth."""
    if not authorization:
        return False
    
    try:
        # Extract Bearer token
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
        
        result = supabase.auth.get_user(token)
        return result.user is not None
    except Exception:
        return False


def _validate_file(filename: str) -> str:
    """Validate file extension and return normalized version."""
    if not filename:
        raise HTTPException(
            status_code=422,
            detail="Nom de fichier invalide"
        )

    ext = None
    for allowed in ALLOWED_EXTENSIONS:
        if filename.lower().endswith(allowed):
            ext = allowed
            break

    if ext is None:
        raise HTTPException(
            status_code=422,
            detail=f"Type de fichier non autorisé. Formats autorisés: csv, xlsx, xls"
        )

    return ext


def _read_file(file: UploadFile) -> pd.DataFrame:
    """Read uploaded file with pandas based on extension."""
    content = file.file.read()
    file.file.seek(0)

    ext = _validate_file(file.filename)

    if ext == ".csv":
        return pd.read_csv(BytesIO(content))
    else:
        return pd.read_excel(BytesIO(content))


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names: strip, lowercase, underscores."""
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace(r"[^a-z0-9_]", "", regex=True)
    )
    return df


def _df_to_rows(df: pd.DataFrame) -> list[dict]:
    """Convert DataFrame to list of dictionaries."""
    return df.to_dict(orient="records")


def _get_current_period() -> str:
    """Get current month as YYYY-MM."""
    return datetime.utcnow().strftime("%Y-%m")


@router.post("/upload")
async def upload_file(
    institution_id: str = Form(...),
    file: UploadFile = File(...),
    authorization: str = Header(None)
) -> JSONResponse:
    """
    Upload and process a CSV or Excel file.

    Steps:
    1. Authenticate user via Bearer token
    2. Read file with pandas
    3. Normalize column names
    4. Compute KPIs
    5. Upsert to kpi_snapshots table
    """
    # Step 1: Authenticate via Bearer token
    if not _verify_auth(authorization):
        raise HTTPException(
            status_code=401,
            detail="Non autorisé"
        )

    # Step 2: Read file
    try:
        df = _read_file(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Erreur de lecture du fichier: {str(e)}"
        )

    if df.empty:
        raise HTTPException(
            status_code=422,
            detail="Le fichier est vide"
        )

    # Step 3: Normalize columns
    df = _normalize_columns(df)

    # Step 4: Compute KPIs
    raw_rows = _df_to_rows(df)
    kpis = compute_kpis(raw_rows, institution_id)

    if not kpis:
        raise HTTPException(
            status_code=422,
            detail="Impossible d'extraire des données du fichier"
        )

    # Step 5: Upsert to Supabase
    period = _get_current_period()
    recorded_at = datetime.utcnow().isoformat()

    kpis_updated = 0

    for kpi_key, data in kpis.items():
        record = {
            "institution_id": institution_id,
            "domain": data["domain"],
            "kpi_key": kpi_key,
            "value": data["value"],
            "period": period,
            "recorded_at": recorded_at,
        }

        try:
            response = supabase.table("kpi_snapshots").upsert(
                record,
                on_conflict="institution_id,kpi_key,period"
            ).execute()

            if response.data:
                kpis_updated += 1
        except Exception as e:
            # Log error but continue - maybe partial success
            print(f"Error upserting {kpi_key}: {e}")

    return JSONResponse({
        "status": "success",
        "kpis_updated": kpis_updated,
        "institution_id": institution_id,
        "period": period
    })