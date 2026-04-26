"""
Services — NL→SQL Agent
Translates a natural language question into a safe, read-only SQL query,
executes it via the run_sql Supabase RPC, and returns the result.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, Optional

from supabase._async.client import AsyncClient

from core.llm import call_llm

logger = logging.getLogger(__name__)

# ── Full schema context for the LLM ──────────────────────────
_SCHEMA = """
-- DIMENSION TABLES
dim_institution(id, code, name, city, region, institution_type, founding_year, student_capacity, is_active)
dim_department(id, institution_id, name, code, head_email)
dim_student(id, institution_id, department_id, program_id, first_name, last_name, gender, nationality, level, status, academic_year, is_scholarship, is_foreign, gpa, enrollment_date)
dim_staff(id, institution_id, department_id, category, grade, contract_type, is_active, hire_date, retirement_date, has_phd)
dim_program(id, institution_id, department_id, name, code, degree_type, duration_years, is_accredited, is_active)
dim_partnership(id, institution_id, partner_name, partner_type, scope, country, status, student_beneficiaries, staff_beneficiaries)
dim_research_project(id, institution_id, title, status, is_funded, budget, start_date, end_date)
dim_space(id, institution_id, name, space_type, capacity, area_sqm, is_accessible, is_active)
dim_equipment(id, institution_id, space_id, name, category, status, purchase_value)
dim_metric(id, domain_id, code, name, unit, higher_is_better, warning_threshold, critical_threshold, formula)
dim_domain(id, code, name, color_hex)
dim_time(id, date, year, month, semester, academic_year, is_weekend)

-- FACT TABLE (the main OLAP table)
fact_kpis(id, institution_id, department_id, metric_id, time_id, value, source, computed_at)

-- SYSTEM TABLES
alerts(id, institution_id, metric_id, severity, alert_type, value, threshold, message, is_resolved, created_at)
reports(id, institution_id, title, report_type, status, created_at)
upload_log(id, institution_id, filename, status, rows_inserted, created_at)
nl_query_log(id, institution_id, raw_query, generated_sql, was_successful, execution_ms, created_at)

-- MATERIALIZED VIEWS (pre-aggregated — fastest for dashboard queries)
mv_success_rate(institution_id, academic_year, semester_id, success_rate, pass_rate, total_students, total_passed)
mv_dropout_rate(institution_id, academic_year, dropout_rate, repetition_rate, graduation_rate, total_enrolled)
mv_hr_summary(institution_id, academic_year, total_staff, permanent_staff, phd_count, encadrement_ratio)
mv_budget_execution(institution_id, fiscal_year, total_budget, consumed_budget, execution_rate)
mv_employability(institution_id, employability_rate, placement_rate)
mv_network_comparison(institution_id, metric_code, value, rank_in_network, academic_year)
mv_attendance_rate(institution_id, attendance_rate, semester_id)
"""

_SQL_SYSTEM = (
    "You are a PostgreSQL expert for a university analytics platform. "
    "Generate a safe, read-only SELECT query using the schema provided. "
    "Rules:\n"
    "- NEVER use INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or TRUNCATE\n"
    "- Always use table aliases for clarity\n"
    "- Prefer materialized views (mv_*) for aggregate data — they are much faster\n"
    "- Join dim_institution when you need institution names\n"
    "- Output ONLY raw SQL — no markdown, no explanation, no backticks"
)


def _extract_sql(raw: str) -> str:
    """Strip markdown code fences and extract clean SQL."""
    raw = raw.strip()
    # Remove ```sql ... ``` or ``` ... ```
    raw = re.sub(r"```(?:sql)?", "", raw, flags=re.IGNORECASE).strip("`").strip()
    # Remove any trailing semicolon and whitespace, since run_sql expects a single statement
    raw = raw.rstrip().rstrip(";")
    return raw


def _is_safe_sql(sql: str) -> bool:
    """Reject any SQL that is not a pure SELECT."""
    forbidden = re.compile(
        r"\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE)\b",
        re.IGNORECASE,
    )
    return not forbidden.search(sql)


async def sql_agent(
    query: str,
    db: AsyncClient,
    institution_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    1. Ask the LLM to generate SQL for the user's question.
    2. Validate it is read-only.
    3. Execute it via the run_sql Supabase RPC.
    4. Return the data and the SQL used.
    """
    # Optionally narrow the query by institution
    scoped_query = query
    if institution_id:
        scoped_query = f"{query} (filter to institution_id = {institution_id})"

    prompt = f"""Schema:
{_SCHEMA}

User question:
{scoped_query}

Write a SQL SELECT query to answer this."""

    raw_sql = await call_llm(prompt, system=_SQL_SYSTEM, temperature=0.0)
    sql = _extract_sql(raw_sql)

    if not _is_safe_sql(sql):
        logger.warning(f"[SQL Agent] Blocked unsafe SQL: {sql[:200]}")
        return {
            "answer": [],
            "sql": sql,
            "error": "Generated SQL was rejected for safety reasons.",
        }

    try:
        result = await db.rpc("run_sql", {"query": sql}).execute()
        data = result.data or []
        logger.info(f"[SQL Agent] Returned {len(data)} rows")

        # Convert raw JSON data to a human-readable sentence
        if not data:
            human_answer = "I couldn't find any data matching your request."
        else:
            synthesis_prompt = f"""
            You are an analyst. A user asked: "{scoped_query}"
            The database returned this raw data: {data[:10]}
            
            Write a professional, concise, conversational answer summarizing this data. 
            Do NOT mention the database, SQL, or raw JSON. Just give the answer naturally.
            """
            human_answer = await call_llm(synthesis_prompt, temperature=0.3)

        return {"answer": human_answer, "sql": sql, "raw_data": data}
    except Exception as e:
        logger.error(f"[SQL Agent] Execution error: {e}")
        return {"answer": f"There was an error querying the database: {e}", "sql": sql, "error": str(e)}
