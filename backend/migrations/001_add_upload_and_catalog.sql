-- ============================================================
--  UCAR Intelligence Hub — Additional Tables Migration
--  Run AFTER the main schema.sql
--  Adds: upload_log, data_catalog (used by backend services)
-- ============================================================

-- ── Upload Log: tracks every file upload for lifecycle management ──
CREATE TABLE IF NOT EXISTS upload_log (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    filename            VARCHAR(500) NOT NULL,
    file_size_bytes     BIGINT,
    file_hash           VARCHAR(64),
    rows_parsed         INT,
    rows_inserted       INT,
    rows_failed         INT,
    status              VARCHAR(20) DEFAULT 'pending',
    error_message       TEXT,
    data_quality_score  NUMERIC(5, 2),
    uploaded_by         VARCHAR(255),
    processing_ms       INT,
    is_duplicate        BOOLEAN DEFAULT FALSE,
    access_count        INT DEFAULT 0,
    last_accessed       TIMESTAMPTZ,
    relevance_score     NUMERIC(5, 2),
    storage_tier        VARCHAR(10) DEFAULT 'hot',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_log_institution ON upload_log(institution_id);
CREATE INDEX IF NOT EXISTS idx_upload_log_hash ON upload_log(file_hash);
CREATE INDEX IF NOT EXISTS idx_upload_log_status ON upload_log(status);


-- ── Data Catalog: searchable metadata for all datasets ──
CREATE TABLE IF NOT EXISTS data_catalog (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      INT NOT NULL REFERENCES dim_institution(id),
    domain_id           INT REFERENCES dim_domain(id),
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    data_type           VARCHAR(50),
    source              VARCHAR(100),
    record_count        INT,
    access_count        INT DEFAULT 0,
    last_accessed       TIMESTAMPTZ,
    relevance_score     NUMERIC(5, 2),
    storage_tier        VARCHAR(10) DEFAULT 'hot',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_catalog_institution ON data_catalog(institution_id);
CREATE INDEX IF NOT EXISTS idx_data_catalog_name ON data_catalog USING gin(name gin_trgm_ops);
