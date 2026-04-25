-- ============================================================
--  UCAR INTELLIGENCE HUB — Complete Database Script
--  Run this once on a fresh PostgreSQL database (Supabase, Neon, local)
--  Order: Extensions → Dimensions → Facts → Indexes → Views → Seed Data
-- ============================================================


-- ============================================================
--  STEP 1 — EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "tablefunc";


-- ============================================================
--  STEP 2 — DIMENSION: INSTITUTION
-- ============================================================
CREATE TABLE dim_institution (
    id                  SERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    code                VARCHAR(20) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    short_name          VARCHAR(50),
    city                VARCHAR(100),
    region              VARCHAR(100),
    institution_type    VARCHAR(50),
    founding_year       INT,
    student_capacity    INT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 3 — DIMENSION: DEPARTMENT
-- ============================================================
CREATE TABLE dim_department (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id) ON DELETE CASCADE,
    code                VARCHAR(30) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    name_fr             VARCHAR(255),
    name_ar             VARCHAR(255),
    field               VARCHAR(100),
    specialty           VARCHAR(100),
    head_name           VARCHAR(255),
    student_count       INT,
    staff_count         INT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, code)
);


-- ============================================================
--  STEP 4 — DIMENSION: TIME
-- ============================================================
CREATE TABLE dim_time (
    id                  SERIAL PRIMARY KEY,
    full_date           DATE UNIQUE NOT NULL,
    day                 INT,
    month               INT,
    month_name          VARCHAR(20),
    quarter             INT,
    semester            INT,
    academic_year       VARCHAR(10),
    year                INT,
    is_exam_period      BOOLEAN DEFAULT FALSE,
    is_holiday          BOOLEAN DEFAULT FALSE
);


-- ============================================================
--  STEP 5 — DIMENSION: DOMAIN
-- ============================================================
CREATE TABLE dim_domain (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(30) UNIQUE NOT NULL,
    name                VARCHAR(100) NOT NULL,
    name_fr             VARCHAR(100),
    name_ar             VARCHAR(100),
    icon                VARCHAR(10),
    color_hex           VARCHAR(7),
    display_order       INT
);


-- ============================================================
--  STEP 6 — DIMENSION: METRIC
-- ============================================================
CREATE TABLE dim_metric (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(60) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    name_fr             VARCHAR(255),
    name_ar             VARCHAR(255),
    domain_id           INT REFERENCES dim_domain(id),
    unit                VARCHAR(30),
    aggregation         VARCHAR(20) DEFAULT 'AVG',
    higher_is_better    BOOLEAN DEFAULT TRUE,
    warning_threshold   NUMERIC,
    critical_threshold  NUMERIC,
    description         TEXT,
    is_active           BOOLEAN DEFAULT TRUE
);


-- ============================================================
--  STEP 7 — FACT TABLE
-- ============================================================
CREATE TABLE fact_kpis (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    metric_id           INT NOT NULL REFERENCES dim_metric(id),
    value               NUMERIC(15, 4) NOT NULL,
    value_previous      NUMERIC(15, 4),
    delta_pct           NUMERIC(8, 2) GENERATED ALWAYS AS (
                            CASE WHEN value_previous IS NOT NULL AND value_previous != 0
                            THEN ROUND(((value - value_previous) / value_previous) * 100, 2)
                            ELSE NULL END
                        ) STORED,
    source              VARCHAR(50) DEFAULT 'manual',
    is_estimated        BOOLEAN DEFAULT FALSE,
    confidence          NUMERIC(4,2),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fact_kpis_unique UNIQUE (institution_id, department_id, time_id, metric_id)
);


-- ============================================================
--  STEP 8 — ALERTS
-- ============================================================
CREATE TABLE alerts (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    metric_id           INT NOT NULL REFERENCES dim_metric(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    fact_id             BIGINT REFERENCES fact_kpis(id),
    severity            VARCHAR(10) NOT NULL CHECK (severity IN ('warning', 'critical')),
    value               NUMERIC(15, 4),
    threshold           NUMERIC(15, 4),
    message             TEXT,
    is_resolved         BOOLEAN DEFAULT FALSE,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 9 — REPORTS
-- ============================================================
CREATE TABLE reports (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE,
    title               VARCHAR(255) NOT NULL,
    report_type         VARCHAR(30),
    scope               VARCHAR(20),
    institution_id      INT REFERENCES dim_institution(id),
    domain_id           INT REFERENCES dim_domain(id),
    period_start        DATE,
    period_end          DATE,
    generated_by        VARCHAR(100),
    file_path           TEXT,
    format              VARCHAR(10),
    ai_summary          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 10 — NL QUERY LOG
-- ============================================================
CREATE TABLE nl_query_log (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             VARCHAR(100),
    institution_id      INT REFERENCES dim_institution(id),
    raw_query           TEXT NOT NULL,
    generated_sql       TEXT,
    result_summary      TEXT,
    execution_ms        INT,
    was_successful      BOOLEAN,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 11 — USERS
-- ============================================================
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE,
    email               VARCHAR(255) UNIQUE NOT NULL,
    full_name           VARCHAR(255),
    role                VARCHAR(30) CHECK (role IN ('superadmin', 'president', 'dean', 'analyst', 'viewer')),
    institution_id      INT REFERENCES dim_institution(id),
    is_active           BOOLEAN DEFAULT TRUE,
    last_login          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 12 — INDEXES
-- ============================================================
CREATE INDEX idx_fact_institution     ON fact_kpis (institution_id);
CREATE INDEX idx_fact_department      ON fact_kpis (department_id);
CREATE INDEX idx_fact_time            ON fact_kpis (time_id);
CREATE INDEX idx_fact_metric          ON fact_kpis (metric_id);
CREATE INDEX idx_fact_inst_time       ON fact_kpis (institution_id, time_id);
CREATE INDEX idx_fact_inst_metric     ON fact_kpis (institution_id, metric_id);
CREATE INDEX idx_fact_inst_dept       ON fact_kpis (institution_id, department_id);
CREATE INDEX idx_fact_metric_time     ON fact_kpis (metric_id, time_id);
CREATE INDEX idx_alerts_severity      ON alerts (severity, is_resolved);
CREATE INDEX idx_alerts_institution   ON alerts (institution_id);
CREATE INDEX idx_time_academic_year   ON dim_time (academic_year, semester);
