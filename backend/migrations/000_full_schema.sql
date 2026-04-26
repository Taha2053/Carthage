-- ============================================================
--  UCAR INTELLIGENCE HUB — Full Database Schema
--  PostgreSQL 14+ (compatible Supabase / Neon / local)
--
--  Domains covered:
--    Academic · Exams · Pedagogy · Enrollment
--    Insertion · Partnerships · Mobility
--    Finance · HR · Research
--    Infrastructure · Equipment · Inventory
--    ESG/CSR · Student Life · Training
--    Data Quality · Alerts · Forecasts · Reports
--    Users · Audit · NL Query · Events
--
--  Run order:
--    1. Extensions
--    2. Core Dimensions
--    3. Domain Dimensions
--    4. Fact Tables
--    5. Intelligence & Quality Tables
--    6. Operational Tables
--    7. Indexes
--    8. Materialized Views
--    9. Seed Data
-- ============================================================


-- ============================================================
--  STEP 1 — EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "tablefunc";
CREATE EXTENSION IF NOT EXISTS "unaccent";


-- ============================================================
--  STEP 2 — CORE DIMENSIONS
-- ============================================================

-- ── 2.1 Institution ─────────────────────────────────────────
CREATE TABLE dim_institution (
    id                  SERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    code                VARCHAR(20)  UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    name_fr             VARCHAR(255),
    name_ar             VARCHAR(255),
    short_name          VARCHAR(50),
    city                VARCHAR(100),
    region              VARCHAR(100),
    address             TEXT,
    latitude            NUMERIC(9,6),
    longitude           NUMERIC(9,6),
    institution_type    VARCHAR(50),   -- université|école|institut|ISET|ISSAT|...
    governing_body      VARCHAR(100),  -- UCAR | autre université
    founding_year       INT,
    student_capacity    INT,
    current_enrollment  INT,
    website             VARCHAR(255),
    phone               VARCHAR(30),
    email               VARCHAR(255),
    rector_name         VARCHAR(255),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2.2 Department / Faculty ─────────────────────────────────
CREATE TABLE dim_department (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id) ON DELETE CASCADE,
    code                VARCHAR(30)  NOT NULL,
    name                VARCHAR(255) NOT NULL,
    name_fr             VARCHAR(255),
    name_ar             VARCHAR(255),
    field               VARCHAR(100),  -- sciences|lettres|droit|ingénierie|médecine|...
    specialty           VARCHAR(100),
    head_name           VARCHAR(255),
    head_email          VARCHAR(255),
    student_count       INT,
    staff_count         INT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, code)
);

-- ── 2.3 Time Dimension ───────────────────────────────────────
CREATE TABLE dim_time (
    id                  SERIAL PRIMARY KEY,
    full_date           DATE UNIQUE NOT NULL,
    day                 INT,
    day_name            VARCHAR(20),
    week_number         INT,
    month               INT,
    month_name          VARCHAR(20),
    quarter             INT,
    semester            INT,           -- 1 or 2
    academic_year       VARCHAR(10),   -- '2024-2025'
    year                INT,
    is_exam_period      BOOLEAN DEFAULT FALSE,
    is_holiday          BOOLEAN DEFAULT FALSE,
    is_weekend          BOOLEAN DEFAULT FALSE
);

-- ── 2.4 Domain ───────────────────────────────────────────────
CREATE TABLE dim_domain (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(30)  UNIQUE NOT NULL,
    name                VARCHAR(100) NOT NULL,
    name_fr             VARCHAR(100),
    name_ar             VARCHAR(100),
    icon                VARCHAR(10),
    color_hex           VARCHAR(7),
    display_order       INT
);

-- ── 2.5 Metric Registry ──────────────────────────────────────
CREATE TABLE dim_metric (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(60)  UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    name_fr             VARCHAR(255),
    name_ar             VARCHAR(255),
    domain_id           INT REFERENCES dim_domain(id),
    unit                VARCHAR(30),   -- %, TND, count, hours, kg_co2, ...
    aggregation         VARCHAR(20)  DEFAULT 'AVG', -- AVG|SUM|COUNT|LAST
    formula             TEXT,          -- description de la formule de calcul
    higher_is_better    BOOLEAN DEFAULT TRUE,
    warning_threshold   NUMERIC,
    critical_threshold  NUMERIC,
    benchmark_national  NUMERIC,       -- valeur de référence nationale
    description         TEXT,
    source_table        VARCHAR(100),  -- table source pour calcul automatique
    is_computed         BOOLEAN DEFAULT FALSE, -- calculé auto ou saisi manuellement
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 3 — DOMAIN DIMENSIONS
-- ============================================================

-- ── 3.1 Student ──────────────────────────────────────────────
CREATE TABLE dim_student (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    student_code        VARCHAR(50)  UNIQUE NOT NULL,
    cin                 VARCHAR(20),
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    gender              VARCHAR(10),   -- M|F
    birth_date          DATE,
    region_origin       VARCHAR(100),
    governorate         VARCHAR(50),
    nationality         VARCHAR(50)  DEFAULT 'TN',
    academic_year       VARCHAR(10)  NOT NULL,
    level               VARCHAR(10),   -- L1|L2|L3|M1|M2|Doc|Ing1|Ing2|Ing3
    program_id          INT,           -- FK added after dim_program
    status              VARCHAR(20)  NOT NULL DEFAULT 'enrolled',
    -- enrolled|dropout|graduated|repeating|suspended|transferred
    enrollment_date     DATE,
    graduation_date     DATE,
    dropout_date        DATE,
    dropout_reason      VARCHAR(100), -- financial|academic|personal|health|unknown
    transfer_to         INT REFERENCES dim_institution(id),
    is_scholarship      BOOLEAN DEFAULT FALSE,
    scholarship_type    VARCHAR(50),
    is_foreign          BOOLEAN DEFAULT FALSE,
    email               VARCHAR(255),
    phone               VARCHAR(30),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.2 Academic Program ─────────────────────────────────────
CREATE TABLE dim_program (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    code                VARCHAR(50)  UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    name_fr             VARCHAR(255),
    name_ar             VARCHAR(255),
    degree_type         VARCHAR(20),   -- Licence|Master|Doctorat|Ingénieur|BTS
    cycle               VARCHAR(10),   -- L|M|D
    duration_years      INT,
    total_credits       INT,
    language            VARCHAR(20)  DEFAULT 'fr',
    is_professional     BOOLEAN DEFAULT FALSE,
    accreditation_date  DATE,
    accreditation_end   DATE,
    ministry_reference  VARCHAR(100),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK now that dim_program exists
ALTER TABLE dim_student
    ADD CONSTRAINT fk_student_program
    FOREIGN KEY (program_id) REFERENCES dim_program(id);

-- ── 3.3 Staff / HR ───────────────────────────────────────────
CREATE TABLE dim_staff (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    staff_code          VARCHAR(50)  UNIQUE,
    cin                 VARCHAR(20),
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    gender              VARCHAR(10),
    birth_year          INT,
    nationality         VARCHAR(50) DEFAULT 'TN',
    category            VARCHAR(30)  NOT NULL,
    -- enseignant|administratif|technique|chercheur|vacataire
    rank                VARCHAR(50),
    -- Professeur|MCA|MCB|Assistant|Moniteur (enseignants)
    -- A|B|C (admin/tech)
    specialty           VARCHAR(100),
    contract_type       VARCHAR(30),  -- permanent|contractuel|vacataire|detachement
    hire_date           DATE,
    email               VARCHAR(255),
    phone               VARCHAR(30),
    is_active           BOOLEAN DEFAULT TRUE,
    departure_date      DATE,
    departure_reason    VARCHAR(50),  -- retirement|resignation|transfer|death|dismissal
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.4 Partnership / Convention ─────────────────────────────
CREATE TABLE dim_partnership (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    partner_name        VARCHAR(255) NOT NULL,
    partner_type        VARCHAR(30),  -- entreprise|université|ONG|gouvernement|organisme
    partnership_type    VARCHAR(30),  -- stage|emploi|recherche|mobilité|cotutelle|formation
    scope               VARCHAR(20),  -- national|international
    country             VARCHAR(100),
    city                VARCHAR(100),
    signing_date        DATE,
    start_date          DATE,
    end_date            DATE,
    renewal_count       INT DEFAULT 0,
    status              VARCHAR(20)  DEFAULT 'active',
    -- active|expired|pending|suspended
    student_beneficiaries INT DEFAULT 0,
    staff_beneficiaries   INT DEFAULT 0,
    financial_value     NUMERIC(12,2),
    currency            VARCHAR(3)   DEFAULT 'TND',
    description         TEXT,
    contact_name        VARCHAR(255),
    contact_email       VARCHAR(255),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.5 Research Project ─────────────────────────────────────
CREATE TABLE dim_research_project (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    reference           VARCHAR(100) UNIQUE,
    title               VARCHAR(500) NOT NULL,
    title_fr            VARCHAR(500),
    project_type        VARCHAR(30),  -- national|international|PHC|bilateral|ERA|H2020
    research_unit       VARCHAR(255),
    laboratory          VARCHAR(255),
    status              VARCHAR(20),  -- active|completed|submitted|rejected|suspended
    start_date          DATE,
    end_date            DATE,
    budget_tnd          NUMERIC(12,2),
    budget_currency     VARCHAR(3)   DEFAULT 'TND',
    funding_source      VARCHAR(255),
    lead_researcher     VARCHAR(255),
    lead_staff_id       BIGINT REFERENCES dim_staff(id),
    partner_institutions TEXT[],
    keywords            TEXT[],
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.6 Space / Rooms ────────────────────────────────────────
CREATE TABLE dim_space (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    code                VARCHAR(50),
    name                VARCHAR(255),
    space_type          VARCHAR(30),  -- amphi|salle_cours|td|labo_info|labo_sci|bureau|
                                      -- bibliotheque|salle_sport|cafeteria|atelier
    building            VARCHAR(100),
    floor               INT,
    capacity            INT,
    area_m2             NUMERIC(8,2),
    has_projector       BOOLEAN DEFAULT FALSE,
    has_smartboard      BOOLEAN DEFAULT FALSE,
    has_ac              BOOLEAN DEFAULT FALSE,
    has_wifi            BOOLEAN DEFAULT FALSE,
    is_accessible       BOOLEAN DEFAULT FALSE,    -- PMR
    is_active           BOOLEAN DEFAULT TRUE,
    last_renovation     DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.7 Equipment / Assets ───────────────────────────────────
CREATE TABLE dim_equipment (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    space_id            INT REFERENCES dim_space(id),
    asset_code          VARCHAR(100) UNIQUE,
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(50),  -- informatique|laboratoire|mobilier|audiovisuel|
                                      -- electroménager|véhicule|instrument|imprimante
    sub_category        VARCHAR(100),
    brand               VARCHAR(100),
    model               VARCHAR(100),
    serial_number       VARCHAR(100),
    purchase_date       DATE,
    purchase_price      NUMERIC(12,2),
    currency            VARCHAR(3)   DEFAULT 'TND',
    supplier            VARCHAR(255),
    status              VARCHAR(20)  DEFAULT 'operational',
    -- operational|maintenance|broken|disposed|stolen|lost
    condition_score     INT CHECK (condition_score BETWEEN 1 AND 5),
    last_maintenance    DATE,
    next_maintenance    DATE,
    warranty_end        DATE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.8 Inventory Item ───────────────────────────────────────
CREATE TABLE dim_inventory_item (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    code                VARCHAR(100),
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(50),  -- fournitures|produits_chimiques|consommables|
                                      -- livres|materiaux|hygiene
    unit                VARCHAR(20),  -- unité|kg|litre|rame|boîte
    min_stock_level     NUMERIC(10,2) DEFAULT 0,
    reorder_point       NUMERIC(10,2) DEFAULT 0,
    unit_cost           NUMERIC(10,2),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.9 Student Activity / Club ──────────────────────────────
CREATE TABLE dim_student_activity (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    name                VARCHAR(255) NOT NULL,
    activity_type       VARCHAR(30),  -- club|sport|culturel|scientifique|associatif
    description         TEXT,
    president_name      VARCHAR(255),
    member_count        INT DEFAULT 0,
    founding_date       DATE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.10 Training Program (Formation continue) ───────────────
CREATE TABLE dim_training_program (
    id                  SERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    code                VARCHAR(50),
    name                VARCHAR(255) NOT NULL,
    target_audience     VARCHAR(30),  -- enseignant|administratif|étudiant|externe
    training_type       VARCHAR(30),  -- professionnel|technique|langue|pédagogique|sécurité
    domain_id           INT REFERENCES dim_domain(id),
    duration_hours      NUMERIC(7,2),
    provider            VARCHAR(255),
    is_external         BOOLEAN DEFAULT FALSE,
    cost_tnd            NUMERIC(10,2) DEFAULT 0,
    is_certified        BOOLEAN DEFAULT FALSE,
    certification_body  VARCHAR(255),
    academic_year       VARCHAR(10),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 4 — FACT TABLES
-- ============================================================

-- ── 4.1 Central KPI Fact Table ───────────────────────────────
CREATE TABLE fact_kpis (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    metric_id           INT NOT NULL REFERENCES dim_metric(id),
    value               NUMERIC(15,4) NOT NULL,
    value_previous      NUMERIC(15,4),
    delta_pct           NUMERIC(8,2) GENERATED ALWAYS AS (
                            CASE WHEN value_previous IS NOT NULL AND value_previous != 0
                            THEN ROUND(((value - value_previous) / value_previous) * 100, 2)
                            ELSE NULL END
                        ) STORED,
    source              VARCHAR(50)  DEFAULT 'computed',
    -- computed|manual|uploaded|api
    is_estimated        BOOLEAN DEFAULT FALSE,
    confidence          NUMERIC(4,2) CHECK (confidence BETWEEN 0 AND 1),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique indexes to handle NULL department_id correctly
CREATE UNIQUE INDEX uidx_fact_kpis_nodept
    ON fact_kpis (institution_id, time_id, metric_id)
    WHERE department_id IS NULL;

CREATE UNIQUE INDEX uidx_fact_kpis_dept
    ON fact_kpis (institution_id, department_id, time_id, metric_id)
    WHERE department_id IS NOT NULL;

-- ── 4.2 Exam Results ─────────────────────────────────────────
CREATE TABLE fact_exam_results (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES dim_student(id),
    institution_id      INT    NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    time_id             INT    NOT NULL REFERENCES dim_time(id),
    program_id          INT REFERENCES dim_program(id),
    subject_code        VARCHAR(50),
    subject_name        VARCHAR(255),
    subject_name_fr     VARCHAR(255),
    exam_type           VARCHAR(20),  -- DS|examen_final|TP|oral|projet
    session             VARCHAR(20),  -- principale|rattrapage|seconde_chance
    grade               NUMERIC(5,2),
    max_grade           NUMERIC(5,2) DEFAULT 20,
    grade_normalized    NUMERIC(5,2) GENERATED ALWAYS AS (
                            CASE WHEN max_grade > 0
                            THEN ROUND((grade / max_grade) * 20, 2)
                            ELSE NULL END
                        ) STORED,
    result              VARCHAR(10),  -- pass|fail|absent|exempt
    coefficient         NUMERIC(4,2) DEFAULT 1,
    credits             INT,
    is_makeup           BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4.3 Attendance ───────────────────────────────────────────
CREATE TABLE fact_attendance (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT REFERENCES dim_student(id),
    staff_id            BIGINT REFERENCES dim_staff(id),   -- for staff attendance
    institution_id      INT    NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    time_id             INT    NOT NULL REFERENCES dim_time(id),
    subject_code        VARCHAR(50),
    session_type        VARCHAR(20),  -- cours_magistral|td|tp|examen
    space_id            INT REFERENCES dim_space(id),
    scheduled_hours     NUMERIC(5,2),
    attended_hours      NUMERIC(5,2),
    absence_type        VARCHAR(20),  -- present|absent_justified|absent_unjustified
    absence_reason      VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4.4 Graduate Tracking / Insertion Pro ────────────────────
CREATE TABLE fact_graduate_tracking (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES dim_student(id),
    institution_id      INT    NOT NULL REFERENCES dim_institution(id),
    program_id          INT REFERENCES dim_program(id),
    graduation_year     VARCHAR(10),
    survey_date         DATE,
    survey_wave         INT,           -- 1st survey (6 months) | 2nd (18 months) | ...
    employment_status   VARCHAR(30),
    -- employed_full|employed_part|self_employed|unemployed_seeking|
    -- unemployed_not_seeking|studying|military|unknown
    employment_date     DATE,
    days_to_employment  INT,           -- computed manually or via trigger
    employer_name       VARCHAR(255),
    employer_sector     VARCHAR(100),
    employer_region     VARCHAR(100),
    employer_country    VARCHAR(100)  DEFAULT 'TN',
    job_title           VARCHAR(255),
    is_field_related    BOOLEAN,       -- emploi lié à la formation?
    contract_type       VARCHAR(30),   -- CDI|CDD|stage|freelance|fonctionnaire
    salary_range        VARCHAR(30),   -- <1000|1000-2000|2000-3500|>3500 TND
    is_international    BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4.5 Student Mobility ─────────────────────────────────────
CREATE TABLE fact_student_mobility (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES dim_student(id),
    institution_id      INT    NOT NULL REFERENCES dim_institution(id),
    partnership_id      INT REFERENCES dim_partnership(id),
    mobility_type       VARCHAR(20),   -- incoming|outgoing
    program_type        VARCHAR(30),   -- erasmus|erasmus_plus|bilateral|cotutelle|stage
    destination_name    VARCHAR(255),
    destination_country VARCHAR(100),
    academic_year       VARCHAR(10),
    semester            INT,
    duration_months     NUMERIC(4,1),
    scholarship_amount  NUMERIC(10,2),
    scholarship_currency VARCHAR(3)   DEFAULT 'EUR',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4.6 Budget / Finance ─────────────────────────────────────
CREATE TABLE fact_budget (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    fiscal_year         VARCHAR(10)  NOT NULL,
    budget_type         VARCHAR(30),
    -- fonctionnement|investissement|recherche|formation|infrastructure
    category            VARCHAR(100),
    -- salaires|equipement|fournitures|maintenance|communication|deplacement|...
    sub_category        VARCHAR(100),
    source              VARCHAR(50),  -- état|propres|subvention|don|recherche
    allocated_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
    engaged_amount      NUMERIC(15,2) DEFAULT 0,   -- engagé non payé
    consumed_amount     NUMERIC(15,2) DEFAULT 0,   -- réellement dépensé
    remaining_amount    NUMERIC(15,2) GENERATED ALWAYS AS
                            (allocated_amount - consumed_amount) STORED,
    execution_rate      NUMERIC(6,2) GENERATED ALWAYS AS (
                            CASE WHEN allocated_amount > 0
                            THEN ROUND((consumed_amount / allocated_amount) * 100, 2)
                            ELSE 0 END
                        ) STORED,
    currency            VARCHAR(3)   DEFAULT 'TND',
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, department_id, time_id, budget_type, category, source)
);

-- ── 4.7 HR Metrics ───────────────────────────────────────────
CREATE TABLE fact_hr_metrics (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    staff_id            BIGINT REFERENCES dim_staff(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    -- Teaching load
    planned_hours       NUMERIC(7,2) DEFAULT 0,
    actual_hours        NUMERIC(7,2) DEFAULT 0,
    overtime_hours      NUMERIC(7,2) DEFAULT 0,
    -- Absences
    working_days        INT DEFAULT 0,
    absence_days        INT DEFAULT 0,
    absence_justified   INT DEFAULT 0,
    absence_unjustified INT DEFAULT 0,
    leave_days          INT DEFAULT 0,      -- congé réglementaire
    sick_days           INT DEFAULT 0,
    -- Supervision
    thesis_supervised   INT DEFAULT 0,
    internships_supervised INT DEFAULT 0,
    -- Performance
    evaluation_score    NUMERIC(5,2),      -- score évaluation périodique
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4.8 Research Output ──────────────────────────────────────
CREATE TABLE fact_research_output (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    project_id          INT REFERENCES dim_research_project(id),
    lead_staff_id       BIGINT REFERENCES dim_staff(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    output_type         VARCHAR(30),
    -- publication|brevet|thèse|conférence|rapport_technique|prototype|livre
    title               VARCHAR(500),
    journal_name        VARCHAR(255),
    conference_name     VARCHAR(255),
    indexing            VARCHAR(50),  -- Scopus|WoS|ERIH|DOAJ|local|non_indexé
    impact_factor       NUMERIC(6,3),
    doi                 VARCHAR(100),
    is_international    BOOLEAN DEFAULT FALSE,
    co_authors_count    INT DEFAULT 1,
    citations_count     INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4.9 Space Occupancy ──────────────────────────────────────
CREATE TABLE fact_space_occupancy (
    id                  BIGSERIAL PRIMARY KEY,
    space_id            INT NOT NULL REFERENCES dim_space(id),
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    total_slots         INT,          -- créneaux disponibles dans la semaine
    used_slots          INT,
    occupancy_rate      NUMERIC(5,2) GENERATED ALWAYS AS (
                            CASE WHEN total_slots > 0
                            THEN ROUND((used_slots::NUMERIC / total_slots) * 100, 2)
                            ELSE 0 END
                        ) STORED,
    peak_hour           VARCHAR(10),
    avg_occupants       NUMERIC(6,1),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (space_id, time_id)
);

-- ── 4.10 ESG / RSE ───────────────────────────────────────────
CREATE TABLE fact_esg_metrics (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    -- Énergie
    electricity_kwh     NUMERIC(12,2) DEFAULT 0,
    gas_m3              NUMERIC(12,2) DEFAULT 0,
    water_m3            NUMERIC(12,2) DEFAULT 0,
    fuel_liters         NUMERIC(10,2) DEFAULT 0,
    renewable_kwh       NUMERIC(12,2) DEFAULT 0,
    renewable_pct       NUMERIC(5,2)  GENERATED ALWAYS AS (
                            CASE WHEN electricity_kwh > 0
                            THEN ROUND((renewable_kwh / electricity_kwh) * 100, 2)
                            ELSE 0 END
                        ) STORED,
    -- Carbone
    carbon_kg_co2       NUMERIC(12,2) DEFAULT 0,
    carbon_per_student  NUMERIC(8,2),  -- calculé via trigger
    -- Déchets
    waste_kg_total      NUMERIC(10,2) DEFAULT 0,
    waste_kg_recycled   NUMERIC(10,2) DEFAULT 0,
    waste_kg_dangerous  NUMERIC(10,2) DEFAULT 0,
    recycling_rate      NUMERIC(5,2)  GENERATED ALWAYS AS (
                            CASE WHEN waste_kg_total > 0
                            THEN ROUND((waste_kg_recycled / waste_kg_total) * 100, 2)
                            ELSE 0 END
                        ) STORED,
    -- Mobilité campus
    car_users_pct       NUMERIC(5,2)  DEFAULT 0,
    public_transport_pct NUMERIC(5,2) DEFAULT 0,
    bike_walk_pct       NUMERIC(5,2)  DEFAULT 0,
    -- Accessibilité
    accessible_rooms_count INT DEFAULT 0,
    accessible_rooms_pct   NUMERIC(5,2),
    -- Biodiversité
    green_area_m2       NUMERIC(10,2) DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, time_id)
);

-- ── 4.11 Inventory Movement ──────────────────────────────────
CREATE TABLE fact_inventory (
    id                  BIGSERIAL PRIMARY KEY,
    item_id             INT NOT NULL REFERENCES dim_inventory_item(id),
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    transaction_type    VARCHAR(20)  NOT NULL,
    -- reception|consumption|adjustment|return|loss|transfer
    quantity_in         NUMERIC(10,2) DEFAULT 0,
    quantity_out        NUMERIC(10,2) DEFAULT 0,
    quantity_balance    NUMERIC(10,2),
    unit_cost           NUMERIC(10,2),
    total_value         NUMERIC(12,2) GENERATED ALWAYS AS
                            (COALESCE(quantity_in - quantity_out, 0) * COALESCE(unit_cost, 0)) STORED,
    reference_doc       VARCHAR(100), -- bon de commande / livraison
    destination_dept    INT REFERENCES dim_department(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4.12 Training Completion ─────────────────────────────────
CREATE TABLE fact_training_completion (
    id                  BIGSERIAL PRIMARY KEY,
    training_id         INT NOT NULL REFERENCES dim_training_program(id),
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    staff_id            BIGINT REFERENCES dim_staff(id),
    student_id          BIGINT REFERENCES dim_student(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    status              VARCHAR(20),  -- inscrit|complété|abandonné|en_cours
    completion_date     DATE,
    score               NUMERIC(5,2),
    passed              BOOLEAN,
    cost_tnd            NUMERIC(10,2),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 5 — INTELLIGENCE & QUALITY TABLES
-- ============================================================

-- ── 5.1 Staging Raw Data (NoSQL-style, JSONB) ────────────────
CREATE TABLE staging_raw_data (
    id                  BIGSERIAL PRIMARY KEY,
    upload_log_id       BIGINT,        -- FK added after upload_log
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    domain_code         VARCHAR(30),
    raw_payload         JSONB NOT NULL,  -- row as-is from Excel/CSV
    mapped_metric       VARCHAR(60),
    mapped_value        NUMERIC(15,4),
    mapped_time_id      INT REFERENCES dim_time(id),
    status              VARCHAR(20)  DEFAULT 'pending',
    -- pending|valid|invalid|processed|skipped
    validation_errors   JSONB,        -- [{"field":"attendance","msg":"value > 100"}]
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5.2 Upload Log ───────────────────────────────────────────
CREATE TABLE upload_log (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    domain_code         VARCHAR(30),
    filename            VARCHAR(500) NOT NULL,
    file_size_bytes     BIGINT,
    file_hash           VARCHAR(64),   -- SHA-256 for dedup
    file_format         VARCHAR(10),   -- xlsx|csv|pdf|json
    rows_parsed         INT DEFAULT 0,
    rows_inserted       INT DEFAULT 0,
    rows_updated        INT DEFAULT 0,
    rows_failed         INT DEFAULT 0,
    rows_duplicate      INT DEFAULT 0,
    status              VARCHAR(20)  DEFAULT 'pending',
    -- pending|processing|completed|failed|partial
    error_message       TEXT,
    data_quality_score  NUMERIC(5,2), -- 0-100
    uploaded_by         VARCHAR(255),
    processed_by        VARCHAR(100), -- worker id
    processing_ms       INT,
    is_duplicate        BOOLEAN DEFAULT FALSE,
    -- lifecycle management
    access_count        INT DEFAULT 0,
    last_accessed       TIMESTAMPTZ,
    relevance_score     NUMERIC(5,2), -- AI computed
    storage_tier        VARCHAR(10)  DEFAULT 'hot',
    -- hot|warm|cold|archived
    archived_at         TIMESTAMPTZ,
    archive_path        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK now that upload_log exists
ALTER TABLE staging_raw_data
    ADD CONSTRAINT fk_staging_upload
    FOREIGN KEY (upload_log_id) REFERENCES upload_log(id);

-- ── 5.3 Data Catalog ─────────────────────────────────────────
CREATE TABLE data_catalog (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    domain_id           INT REFERENCES dim_domain(id),
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    data_type           VARCHAR(50),
    source_table        VARCHAR(100),
    source              VARCHAR(100),
    record_count        INT DEFAULT 0,
    last_updated        TIMESTAMPTZ,
    tags                TEXT[],
    access_count        INT DEFAULT 0,
    last_accessed       TIMESTAMPTZ,
    relevance_score     NUMERIC(5,2),
    storage_tier        VARCHAR(10)  DEFAULT 'hot',
    is_public           BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5.4 Data Quality Rules ───────────────────────────────────
CREATE TABLE data_quality_rules (
    id                  SERIAL PRIMARY KEY,
    metric_id           INT REFERENCES dim_metric(id),
    domain_id           INT REFERENCES dim_domain(id),
    rule_name           VARCHAR(100) NOT NULL,
    rule_type           VARCHAR(30)  NOT NULL,
    -- not_null|range|format|consistency|uniqueness|cross_field
    rule_expression     JSONB NOT NULL,
    -- {"min": 0, "max": 100} | {"regex": "..."} | {"reference_table": "..."}
    error_message       TEXT,
    suggestion_template TEXT,         -- AI correction template
    severity            VARCHAR(10)   DEFAULT 'warning',
    -- info|warning|critical
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5.5 Data Quality Issues ──────────────────────────────────
CREATE TABLE data_quality_issues (
    id                  BIGSERIAL PRIMARY KEY,
    staging_id          BIGINT REFERENCES staging_raw_data(id),
    fact_id             BIGINT REFERENCES fact_kpis(id),
    upload_log_id       BIGINT REFERENCES upload_log(id),
    rule_id             INT REFERENCES data_quality_rules(id),
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    issue_type          VARCHAR(30),
    affected_field      VARCHAR(100),
    bad_value           TEXT,
    expected_format     TEXT,
    suggested_fix       TEXT,         -- AI generated suggestion
    is_resolved         BOOLEAN DEFAULT FALSE,
    resolved_by         VARCHAR(255),
    resolved_at         TIMESTAMPTZ,
    resolution_note     TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5.6 Alerts ───────────────────────────────────────────────
CREATE TABLE alerts (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    metric_id           INT NOT NULL REFERENCES dim_metric(id),
    time_id             INT NOT NULL REFERENCES dim_time(id),
    fact_id             BIGINT REFERENCES fact_kpis(id),
    severity            VARCHAR(10)  NOT NULL CHECK (severity IN ('info','warning','critical')),
    alert_type          VARCHAR(30)  DEFAULT 'threshold',
    -- threshold|anomaly|trend|forecast|data_quality
    value               NUMERIC(15,4),
    threshold           NUMERIC(15,4),
    delta_pct           NUMERIC(8,2),
    message             TEXT,
    explanation         TEXT,         -- AI-generated explainable reason
    recommended_action  TEXT,
    priority_score      NUMERIC(5,2), -- AI prioritization (0-100)
    is_resolved         BOOLEAN DEFAULT FALSE,
    resolved_by         VARCHAR(255),
    resolved_at         TIMESTAMPTZ,
    resolution_note     TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5.7 KPI Forecasts ────────────────────────────────────────
CREATE TABLE kpi_forecasts (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    metric_id           INT NOT NULL REFERENCES dim_metric(id),
    forecast_date       DATE NOT NULL,
    predicted_value     NUMERIC(15,4) NOT NULL,
    confidence_low      NUMERIC(15,4),
    confidence_high     NUMERIC(15,4),
    confidence_level    NUMERIC(4,2)  DEFAULT 0.95,
    model_name          VARCHAR(50),
    -- linear_regression|arima|prophet|rule_based|moving_average
    horizon_days        INT,
    mape                NUMERIC(8,4), -- Mean Absolute Percentage Error
    based_on_periods    INT,          -- nb of historical periods used
    generated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, department_id, metric_id, forecast_date)
);

-- ── 5.8 Institutional Benchmarks ────────────────────────────
CREATE TABLE institutional_benchmarks (
    id                  SERIAL PRIMARY KEY,
    metric_id           INT NOT NULL REFERENCES dim_metric(id),
    academic_year       VARCHAR(10),
    scope               VARCHAR(20),  -- national|ucar_network|regional|international
    benchmark_value     NUMERIC(15,4) NOT NULL,
    percentile_10       NUMERIC(15,4),
    percentile_25       NUMERIC(15,4),
    percentile_50       NUMERIC(15,4),
    percentile_75       NUMERIC(15,4),
    percentile_90       NUMERIC(15,4),
    sample_size         INT,
    source              VARCHAR(100),
    valid_from          DATE,
    valid_to            DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (metric_id, academic_year, scope)
);


-- ============================================================
--  STEP 6 — OPERATIONAL TABLES
-- ============================================================

-- ── 6.1 Users ────────────────────────────────────────────────
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE,
    email               VARCHAR(255) UNIQUE NOT NULL,
    full_name           VARCHAR(255),
    role                VARCHAR(30) CHECK (role IN (
                            'superadmin','president','rector','dean',
                            'department_head','analyst','hr_manager',
                            'finance_manager','researcher','viewer'
                        )),
    institution_id      INT REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    -- NULL = access to all institutions (superadmin/president)
    auth_provider       VARCHAR(20)  DEFAULT 'local',
    -- local|google|microsoft|ldap
    password_hash       TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    last_login          TIMESTAMPTZ,
    failed_attempts     INT DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6.2 User Preferences ─────────────────────────────────────
CREATE TABLE user_preferences (
    id                  SERIAL PRIMARY KEY,
    user_id             INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language            VARCHAR(5)   DEFAULT 'fr',  -- fr|ar|en
    pinned_metrics      VARCHAR(60)[],
    pinned_domains      VARCHAR(30)[],
    default_institution INT REFERENCES dim_institution(id),
    default_view        VARCHAR(50)  DEFAULT 'dashboard',
    default_period      VARCHAR(20)  DEFAULT 'current_semester',
    dashboard_layout    JSONB,
    notification_settings JSONB,
    -- {"email": true, "ui": true, "critical_only": false}
    theme               VARCHAR(20)  DEFAULT 'light',
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6.3 Audit Log ────────────────────────────────────────────
CREATE TABLE audit_log (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             INT REFERENCES users(id),
    user_email          VARCHAR(255),  -- snapshot in case user deleted
    action              VARCHAR(30)  NOT NULL,
    -- INSERT|UPDATE|DELETE|LOGIN|LOGOUT|EXPORT|VIEW|UPLOAD|GENERATE_REPORT
    entity_type         VARCHAR(50),
    entity_id           BIGINT,
    old_value           JSONB,
    new_value           JSONB,
    ip_address          INET,
    user_agent          TEXT,
    institution_id      INT REFERENCES dim_institution(id),
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6.4 Event Queue ──────────────────────────────────────────
CREATE TABLE event_queue (
    id                  BIGSERIAL PRIMARY KEY,
    event_type          VARCHAR(60)  NOT NULL,
    -- data_uploaded|kpi_computed|alert_triggered|report_generated|
    -- quality_check_done|forecast_updated
    payload             JSONB NOT NULL,
    institution_id      INT REFERENCES dim_institution(id),
    status              VARCHAR(20)  DEFAULT 'pending',
    -- pending|processing|done|failed|skipped
    priority            INT DEFAULT 5,   -- 1=highest, 10=lowest
    retries             INT DEFAULT 0,
    max_retries         INT DEFAULT 3,
    error_message       TEXT,
    scheduled_at        TIMESTAMPTZ DEFAULT NOW(),
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6.5 Report Templates ─────────────────────────────────────
CREATE TABLE report_templates (
    id                  SERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE,
    name                VARCHAR(255) NOT NULL,
    name_fr             VARCHAR(255),
    description         TEXT,
    scope               VARCHAR(20),  -- institution|network|department|domain
    frequency           VARCHAR(20),  -- weekly|monthly|quarterly|annual|on_demand
    domain_ids          INT[],
    metric_codes        VARCHAR(60)[],
    include_charts      BOOLEAN DEFAULT TRUE,
    include_ai_summary  BOOLEAN DEFAULT TRUE,
    include_benchmarks  BOOLEAN DEFAULT TRUE,
    layout_config       JSONB,
    -- chart types, ordering, color scheme, branding
    output_formats      VARCHAR(10)[] DEFAULT ARRAY['pdf','xlsx'],
    auto_send_to        VARCHAR(30),  -- role that auto-receives this report
    is_active           BOOLEAN DEFAULT TRUE,
    created_by          INT REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6.6 Reports ──────────────────────────────────────────────
CREATE TABLE reports (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID DEFAULT uuid_generate_v4() UNIQUE,
    template_id         INT REFERENCES report_templates(id),
    title               VARCHAR(255) NOT NULL,
    report_type         VARCHAR(30),  -- academic|finance|hr|esg|research|global
    scope               VARCHAR(20),  -- institution|network|department
    institution_id      INT REFERENCES dim_institution(id),
    department_id       INT REFERENCES dim_department(id),
    domain_id           INT REFERENCES dim_domain(id),
    period_start        DATE,
    period_end          DATE,
    academic_year       VARCHAR(10),
    generated_by        INT REFERENCES users(id),
    generation_type     VARCHAR(20)  DEFAULT 'on_demand',
    -- on_demand|scheduled|triggered
    file_path           TEXT,
    format              VARCHAR(10),  -- pdf|xlsx|html
    file_size_bytes     BIGINT,
    ai_summary          TEXT,        -- AI-generated executive summary
    status              VARCHAR(20)  DEFAULT 'generating',
    -- generating|ready|failed
    download_count      INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6.7 Notification Log ─────────────────────────────────────
CREATE TABLE notification_log (
    id                  BIGSERIAL PRIMARY KEY,
    alert_id            BIGINT REFERENCES alerts(id),
    report_id           BIGINT REFERENCES reports(id),
    user_id             INT NOT NULL REFERENCES users(id),
    channel             VARCHAR(20),  -- ui|email|webhook|sms
    subject             VARCHAR(255),
    payload             JSONB,
    delivered_at        TIMESTAMPTZ,
    was_read            BOOLEAN DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6.8 NL Query Log ─────────────────────────────────────────
CREATE TABLE nl_query_log (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             INT REFERENCES users(id),
    institution_id      INT REFERENCES dim_institution(id),
    raw_query           TEXT NOT NULL,
    detected_intent     VARCHAR(50),    -- kpi_query|report_request|alert_check|comparison
    detected_domain     VARCHAR(30),
    detected_metric     VARCHAR(60),
    detected_period     VARCHAR(50),
    generated_sql       TEXT,
    result_summary      TEXT,
    result_row_count    INT,
    execution_ms        INT,
    was_successful      BOOLEAN,
    user_rating         INT CHECK (user_rating BETWEEN 1 AND 5),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  STEP 7 — INDEXES
-- ============================================================

-- fact_kpis
CREATE INDEX idx_fkpi_institution   ON fact_kpis (institution_id);
CREATE INDEX idx_fkpi_department    ON fact_kpis (department_id);
CREATE INDEX idx_fkpi_time          ON fact_kpis (time_id);
CREATE INDEX idx_fkpi_metric        ON fact_kpis (metric_id);
CREATE INDEX idx_fkpi_inst_time     ON fact_kpis (institution_id, time_id);
CREATE INDEX idx_fkpi_inst_metric   ON fact_kpis (institution_id, metric_id);
CREATE INDEX idx_fkpi_metric_time   ON fact_kpis (metric_id, time_id);

-- fact_exam_results
CREATE INDEX idx_exam_student       ON fact_exam_results (student_id);
CREATE INDEX idx_exam_institution   ON fact_exam_results (institution_id);
CREATE INDEX idx_exam_time          ON fact_exam_results (time_id);
CREATE INDEX idx_exam_result        ON fact_exam_results (result);

-- fact_attendance
CREATE INDEX idx_att_student        ON fact_attendance (student_id);
CREATE INDEX idx_att_institution    ON fact_attendance (institution_id);
CREATE INDEX idx_att_time           ON fact_attendance (time_id);

-- fact_budget
CREATE INDEX idx_budget_institution ON fact_budget (institution_id);
CREATE INDEX idx_budget_fiscal_year ON fact_budget (fiscal_year);
CREATE INDEX idx_budget_type        ON fact_budget (budget_type);

-- dim_student
CREATE INDEX idx_student_institution ON dim_student (institution_id);
CREATE INDEX idx_student_status      ON dim_student (status);
CREATE INDEX idx_student_acad_year   ON dim_student (academic_year);
CREATE INDEX idx_student_program     ON dim_student (program_id);

-- dim_staff
CREATE INDEX idx_staff_institution  ON dim_staff (institution_id);
CREATE INDEX idx_staff_category     ON dim_staff (category);
CREATE INDEX idx_staff_active       ON dim_staff (is_active);

-- alerts
CREATE INDEX idx_alert_severity     ON alerts (severity, is_resolved);
CREATE INDEX idx_alert_institution  ON alerts (institution_id);
CREATE INDEX idx_alert_metric       ON alerts (metric_id);
CREATE INDEX idx_alert_created      ON alerts (created_at DESC);
CREATE INDEX idx_alert_priority     ON alerts (priority_score DESC);

-- upload_log
CREATE INDEX idx_upload_institution ON upload_log (institution_id);
CREATE INDEX idx_upload_hash        ON upload_log (file_hash);
CREATE INDEX idx_upload_status      ON upload_log (status);
CREATE INDEX idx_upload_tier        ON upload_log (storage_tier);

-- staging_raw_data
CREATE INDEX idx_staging_upload     ON staging_raw_data (upload_log_id);
CREATE INDEX idx_staging_status     ON staging_raw_data (status);
CREATE INDEX idx_staging_payload    ON staging_raw_data USING GIN (raw_payload);

-- data_catalog
CREATE INDEX idx_catalog_name       ON data_catalog USING GIN (name gin_trgm_ops);
CREATE INDEX idx_catalog_institution ON data_catalog (institution_id);

-- dim_time
CREATE INDEX idx_time_acad_year     ON dim_time (academic_year, semester);
CREATE INDEX idx_time_full_date     ON dim_time (full_date);

-- event_queue
CREATE INDEX idx_event_status       ON event_queue (status, priority, scheduled_at);
CREATE INDEX idx_event_institution  ON event_queue (institution_id);

-- audit_log
CREATE INDEX idx_audit_user         ON audit_log (user_id);
CREATE INDEX idx_audit_entity       ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_created      ON audit_log (created_at DESC);

-- nl_query_log
CREATE INDEX idx_nlq_user           ON nl_query_log (user_id);
CREATE INDEX idx_nlq_created        ON nl_query_log (created_at DESC);

-- kpi_forecasts
CREATE INDEX idx_forecast_inst_metric ON kpi_forecasts (institution_id, metric_id);
CREATE INDEX idx_forecast_date        ON kpi_forecasts (forecast_date);


-- ============================================================
--  STEP 8 — MATERIALIZED VIEWS (KPI Engine)
-- ============================================================

-- ── MV 1 : Success Rate by institution / department ──────────
CREATE MATERIALIZED VIEW mv_success_rate AS
SELECT
    er.institution_id,
    er.department_id,
    t.academic_year,
    t.semester,
    er.session,
    COUNT(DISTINCT er.student_id)                                           AS total_students,
    COUNT(DISTINCT CASE WHEN er.result = 'pass' THEN er.student_id END)    AS passed_students,
    COUNT(DISTINCT CASE WHEN er.result = 'fail' THEN er.student_id END)    AS failed_students,
    COUNT(DISTINCT CASE WHEN er.result = 'absent' THEN er.student_id END)  AS absent_students,
    ROUND(
        COUNT(DISTINCT CASE WHEN er.result = 'pass' THEN er.student_id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT er.student_id), 0) * 100, 2
    )                                                                       AS success_rate_pct,
    ROUND(AVG(er.grade_normalized), 2)                                      AS avg_grade
FROM fact_exam_results er
JOIN dim_time t ON t.id = er.time_id
GROUP BY er.institution_id, er.department_id, t.academic_year, t.semester, er.session
WITH DATA;

CREATE UNIQUE INDEX ON mv_success_rate
    (institution_id, department_id, academic_year, semester, session);

-- ── MV 2 : Dropout & Repetition Rate ────────────────────────
CREATE MATERIALIZED VIEW mv_dropout_rate AS
SELECT
    institution_id,
    department_id,
    academic_year,
    COUNT(*)                                                             AS total_enrolled,
    COUNT(CASE WHEN status = 'dropout'   THEN 1 END)                   AS dropouts,
    COUNT(CASE WHEN status = 'repeating' THEN 1 END)                   AS repeating,
    COUNT(CASE WHEN status = 'graduated' THEN 1 END)                   AS graduated,
    ROUND(COUNT(CASE WHEN status = 'dropout'   THEN 1 END)::NUMERIC /
        NULLIF(COUNT(*), 0) * 100, 2)                                  AS dropout_rate_pct,
    ROUND(COUNT(CASE WHEN status = 'repeating' THEN 1 END)::NUMERIC /
        NULLIF(COUNT(*), 0) * 100, 2)                                  AS repetition_rate_pct,
    ROUND(COUNT(CASE WHEN status = 'graduated' THEN 1 END)::NUMERIC /
        NULLIF(COUNT(*), 0) * 100, 2)                                  AS graduation_rate_pct
FROM dim_student
GROUP BY institution_id, department_id, academic_year
WITH DATA;

CREATE UNIQUE INDEX ON mv_dropout_rate (institution_id, department_id, academic_year);

-- ── MV 3 : Attendance Rate ───────────────────────────────────
CREATE MATERIALIZED VIEW mv_attendance_rate AS
SELECT
    institution_id,
    department_id,
    time_id,
    COUNT(DISTINCT student_id)                              AS students_tracked,
    ROUND(SUM(attended_hours) /
        NULLIF(SUM(scheduled_hours), 0) * 100, 2)          AS attendance_rate_pct,
    SUM(scheduled_hours)                                    AS total_scheduled_hours,
    SUM(attended_hours)                                     AS total_attended_hours
FROM fact_attendance
WHERE student_id IS NOT NULL
GROUP BY institution_id, department_id, time_id
WITH DATA;

CREATE INDEX ON mv_attendance_rate (institution_id, time_id);

-- ── MV 4 : Budget Execution ──────────────────────────────────
CREATE MATERIALIZED VIEW mv_budget_execution AS
SELECT
    institution_id,
    department_id,
    fiscal_year,
    budget_type,
    SUM(allocated_amount)   AS total_allocated,
    SUM(consumed_amount)    AS total_consumed,
    SUM(remaining_amount)   AS total_remaining,
    ROUND(SUM(consumed_amount) /
        NULLIF(SUM(allocated_amount), 0) * 100, 2) AS execution_rate_pct,
    COUNT(DISTINCT category) AS category_count
FROM fact_budget
GROUP BY institution_id, department_id, fiscal_year, budget_type
WITH DATA;

CREATE UNIQUE INDEX ON mv_budget_execution
    (institution_id, department_id, fiscal_year, budget_type);

-- ── MV 5 : Employability / Insertion Rate ────────────────────
CREATE MATERIALIZED VIEW mv_employability AS
SELECT
    gt.institution_id,
    gt.graduation_year,
    COUNT(*)                                                                AS graduates_surveyed,
    COUNT(CASE WHEN gt.employment_status LIKE 'employ%' THEN 1 END)        AS employed_count,
    ROUND(COUNT(CASE WHEN gt.employment_status LIKE 'employ%' THEN 1 END)::NUMERIC /
        NULLIF(COUNT(*), 0) * 100, 2)                                      AS employability_rate_pct,
    ROUND(AVG(gt.days_to_employment), 0)                                   AS avg_days_to_employment,
    COUNT(CASE WHEN gt.is_field_related = TRUE THEN 1 END)                 AS field_related_jobs,
    ROUND(COUNT(CASE WHEN gt.is_field_related = TRUE THEN 1 END)::NUMERIC /
        NULLIF(COUNT(CASE WHEN gt.employment_status LIKE 'employ%' THEN 1 END), 0) * 100, 2)
                                                                           AS field_relevance_pct
FROM fact_graduate_tracking gt
GROUP BY gt.institution_id, gt.graduation_year
WITH DATA;

CREATE UNIQUE INDEX ON mv_employability (institution_id, graduation_year);

-- ── MV 6 : HR Summary ────────────────────────────────────────
--
--  FIX: fact_hr_metrics has no training_hours / trainings_completed columns.
--  Training data lives in fact_training_completion + dim_training_program.
--  We LEFT JOIN a pre-aggregated training subquery keyed on
--  (staff_id, academic_year) to avoid fan-out multiplication.
-- ─────────────────────────────────────────────────────────────
CREATE MATERIALIZED VIEW mv_hr_summary AS
SELECT
    s.institution_id,
    s.department_id,
    t.academic_year,
    COUNT(DISTINCT s.id)                                                       AS total_staff,
    COUNT(DISTINCT CASE WHEN s.category = 'enseignant'    THEN s.id END)       AS teaching_staff,
    COUNT(DISTINCT CASE WHEN s.category = 'administratif' THEN s.id END)       AS admin_staff,
    COUNT(DISTINCT CASE WHEN s.category = 'technique'     THEN s.id END)       AS technical_staff,
    ROUND(AVG(hrm.absence_days)::NUMERIC, 2)                                   AS avg_absence_days,
    ROUND(AVG(hrm.actual_hours)::NUMERIC, 2)                                   AS avg_teaching_hours,
    -- Training totals sourced from fact_training_completion
    COALESCE(SUM(tr.staff_training_hours), 0)                                  AS total_training_hours,
    COALESCE(SUM(tr.staff_trainings_completed), 0)                             AS total_trainings_completed
FROM dim_staff s
JOIN fact_hr_metrics hrm ON hrm.staff_id = s.id
JOIN dim_time t           ON t.id = hrm.time_id
-- Pre-aggregate training per (staff_id, academic_year) to avoid row multiplication
LEFT JOIN (
    SELECT
        ftc.staff_id,
        t2.academic_year,
        SUM(tp.duration_hours)                                                 AS staff_training_hours,
        COUNT(CASE WHEN ftc.status = 'complété' THEN 1 END)                   AS staff_trainings_completed
    FROM fact_training_completion ftc
    JOIN dim_training_program tp ON tp.id  = ftc.training_id
    JOIN dim_time             t2 ON t2.id  = ftc.time_id
    WHERE ftc.staff_id IS NOT NULL
    GROUP BY ftc.staff_id, t2.academic_year
) tr ON tr.staff_id = s.id
     AND tr.academic_year = t.academic_year
WHERE s.is_active = TRUE
GROUP BY s.institution_id, s.department_id, t.academic_year
WITH DATA;

CREATE INDEX ON mv_hr_summary (institution_id, academic_year);

-- ── MV 7 : Research KPIs ─────────────────────────────────────
CREATE MATERIALIZED VIEW mv_research_kpis AS
SELECT
    ro.institution_id,
    t.academic_year,
    COUNT(DISTINCT ro.project_id)                                     AS active_projects,
    COUNT(CASE WHEN ro.output_type = 'publication' THEN 1 END)        AS publications,
    COUNT(CASE WHEN ro.output_type = 'brevet' THEN 1 END)             AS patents,
    COUNT(CASE WHEN ro.output_type = 'thèse' THEN 1 END)              AS theses,
    COUNT(CASE WHEN ro.indexing IN ('Scopus','WoS') THEN 1 END)       AS indexed_publications,
    COUNT(CASE WHEN ro.is_international = TRUE THEN 1 END)            AS international_outputs,
    ROUND(AVG(ro.impact_factor), 3)                                   AS avg_impact_factor,
    SUM(rp.budget_tnd)                                                AS total_research_budget
FROM fact_research_output ro
JOIN dim_time t ON t.id = ro.time_id
LEFT JOIN dim_research_project rp ON rp.id = ro.project_id
GROUP BY ro.institution_id, t.academic_year
WITH DATA;

CREATE UNIQUE INDEX ON mv_research_kpis (institution_id, academic_year);

-- ── MV 8 : Network-wide KPI Comparison ───────────────────────
CREATE MATERIALIZED VIEW mv_network_comparison AS
SELECT
    fk.metric_id,
    m.code              AS metric_code,
    m.name              AS metric_name,
    m.unit,
    t.academic_year,
    t.semester,
    i.id                AS institution_id,
    i.short_name        AS institution_name,
    fk.value,
    AVG(fk.value) OVER (
        PARTITION BY fk.metric_id, t.academic_year, t.semester
    )                   AS network_avg,
    RANK() OVER (
        PARTITION BY fk.metric_id, t.academic_year, t.semester
        ORDER BY CASE WHEN m.higher_is_better THEN fk.value ELSE -fk.value END DESC
    )                   AS network_rank,
    fk.delta_pct
FROM fact_kpis fk
JOIN dim_metric m ON m.id = fk.metric_id
JOIN dim_time t ON t.id = fk.time_id
JOIN dim_institution i ON i.id = fk.institution_id
WHERE fk.department_id IS NULL  -- institution-level KPIs only
WITH DATA;

CREATE INDEX ON mv_network_comparison (institution_id, metric_id);
CREATE INDEX ON mv_network_comparison (metric_code, academic_year);





CREATE TABLE documents (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  INT REFERENCES dim_institution(id),

    title           TEXT,
    content         TEXT NOT NULL,

    source          TEXT,              -- pdf, report, web, manual, etc.
    doc_type        VARCHAR(50),       -- policy, report, note, syllabus, etc.

    embedding       vector(1536),      -- OpenAI text-embedding-3-small

    metadata        JSONB DEFAULT '{}',

    created_at      TIMESTAMPTZ DEFAULT NOW()
);




