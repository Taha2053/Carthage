-- ============================================================
--  STEP 21 — MATERIALIZED VIEWS
-- ============================================================

-- Latest KPI value per institution per metric
CREATE MATERIALIZED VIEW mv_latest_kpis AS
SELECT
    f.institution_id,
    i.name                  AS institution_name,
    i.code                  AS institution_code,
    i.city,
    f.metric_id,
    m.code                  AS metric_code,
    m.name                  AS metric_name,
    m.unit,
    m.higher_is_better,
    m.warning_threshold,
    m.critical_threshold,
    d.code                  AS domain_code,
    d.name                  AS domain_name,
    d.color_hex,
    t.academic_year,
    t.semester,
    f.value,
    f.value_previous,
    f.delta_pct,
    CASE
        WHEN m.higher_is_better  AND m.critical_threshold IS NOT NULL AND f.value < m.critical_threshold THEN 'critical'
        WHEN m.higher_is_better  AND m.warning_threshold  IS NOT NULL AND f.value < m.warning_threshold  THEN 'warning'
        WHEN NOT m.higher_is_better AND m.critical_threshold IS NOT NULL AND f.value > m.critical_threshold THEN 'critical'
        WHEN NOT m.higher_is_better AND m.warning_threshold  IS NOT NULL AND f.value > m.warning_threshold  THEN 'warning'
        ELSE 'normal'
    END                     AS status
FROM fact_kpis f
JOIN dim_institution i  ON f.institution_id = i.id
JOIN dim_metric m       ON f.metric_id = m.id
JOIN dim_domain d       ON m.domain_id = d.id
JOIN dim_time t         ON f.time_id = t.id
WHERE f.department_id IS NULL
  AND (f.institution_id, f.metric_id, f.time_id) IN (
    SELECT institution_id, metric_id, MAX(time_id)
    FROM fact_kpis
    WHERE department_id IS NULL
    GROUP BY institution_id, metric_id
);

-- Latest KPI per department
CREATE MATERIALIZED VIEW mv_latest_kpis_by_dept AS
SELECT
    f.institution_id,
    i.name                  AS institution_name,
    i.code                  AS institution_code,
    f.department_id,
    dep.code                AS department_code,
    dep.name                AS department_name,
    dep.specialty,
    f.metric_id,
    m.code                  AS metric_code,
    m.name                  AS metric_name,
    m.unit,
    m.higher_is_better,
    m.warning_threshold,
    m.critical_threshold,
    d.code                  AS domain_code,
    d.name                  AS domain_name,
    d.color_hex,
    t.academic_year,
    t.semester,
    f.value,
    f.delta_pct,
    CASE
        WHEN m.higher_is_better  AND m.critical_threshold IS NOT NULL AND f.value < m.critical_threshold THEN 'critical'
        WHEN m.higher_is_better  AND m.warning_threshold  IS NOT NULL AND f.value < m.warning_threshold  THEN 'warning'
        WHEN NOT m.higher_is_better AND m.critical_threshold IS NOT NULL AND f.value > m.critical_threshold THEN 'critical'
        WHEN NOT m.higher_is_better AND m.warning_threshold  IS NOT NULL AND f.value > m.warning_threshold  THEN 'warning'
        ELSE 'normal'
    END                     AS status
FROM fact_kpis f
JOIN dim_institution i      ON f.institution_id = i.id
JOIN dim_department dep     ON f.department_id = dep.id
JOIN dim_metric m           ON f.metric_id = m.id
JOIN dim_domain d           ON m.domain_id = d.id
JOIN dim_time t             ON f.time_id = t.id
WHERE f.department_id IS NOT NULL
  AND (f.institution_id, f.department_id, f.metric_id, f.time_id) IN (
    SELECT institution_id, department_id, metric_id, MAX(time_id)
    FROM fact_kpis WHERE department_id IS NOT NULL
    GROUP BY institution_id, department_id, metric_id
);

-- Cross-institution domain averages
CREATE MATERIALIZED VIEW mv_domain_averages AS
SELECT
    d.code                  AS domain_code,
    d.name                  AS domain_name,
    d.color_hex,
    t.academic_year,
    t.semester,
    COUNT(DISTINCT f.institution_id) AS institution_count,
    ROUND(AVG(f.value)::NUMERIC, 2)  AS avg_value,
    ROUND(MIN(f.value)::NUMERIC, 2)  AS min_value,
    ROUND(MAX(f.value)::NUMERIC, 2)  AS max_value,
    ROUND(STDDEV(f.value)::NUMERIC, 2) AS stddev_value
FROM fact_kpis f
JOIN dim_metric m   ON f.metric_id = m.id
JOIN dim_domain d   ON m.domain_id = d.id
JOIN dim_time t     ON f.time_id = t.id
WHERE f.department_id IS NULL
GROUP BY d.code, d.name, d.color_hex, t.academic_year, t.semester;

-- Department ranking within institution
CREATE MATERIALIZED VIEW mv_dept_comparison AS
SELECT
    i.name                  AS institution_name,
    dep.specialty           AS department_specialty,
    m.code                  AS metric_code,
    m.name                  AS metric_name,
    m.unit,
    t.academic_year,
    t.semester,
    f.value,
    RANK() OVER (
        PARTITION BY f.institution_id, f.metric_id, t.academic_year, t.semester
        ORDER BY f.value DESC
    )                       AS rank_within_institution
FROM fact_kpis f
JOIN dim_institution i      ON f.institution_id = i.id
JOIN dim_department dep     ON f.department_id = dep.id
JOIN dim_metric m           ON f.metric_id = m.id
JOIN dim_time t             ON f.time_id = t.id
WHERE f.department_id IS NOT NULL;


-- ============================================================
--  STEP 22 — AUTO-ALERT FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION generate_alerts()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO alerts (institution_id, department_id, metric_id, time_id, fact_id, severity, value, threshold, message)
    SELECT
        f.institution_id,
        f.department_id,
        f.metric_id,
        f.time_id,
        f.id,
        CASE
            WHEN m.higher_is_better  AND f.value < m.critical_threshold THEN 'critical'
            WHEN m.higher_is_better  AND f.value < m.warning_threshold  THEN 'warning'
            WHEN NOT m.higher_is_better AND f.value > m.critical_threshold THEN 'critical'
            WHEN NOT m.higher_is_better AND f.value > m.warning_threshold  THEN 'warning'
        END AS severity,
        f.value,
        CASE
            WHEN m.higher_is_better  AND f.value < m.critical_threshold THEN m.critical_threshold
            WHEN m.higher_is_better  AND f.value < m.warning_threshold  THEN m.warning_threshold
            WHEN NOT m.higher_is_better AND f.value > m.critical_threshold THEN m.critical_threshold
            ELSE m.warning_threshold
        END AS threshold,
        i.name || ' -- ' || m.name || ' is ' || f.value || m.unit AS message
    FROM fact_kpis f
    JOIN dim_metric m      ON f.metric_id = m.id
    JOIN dim_institution i ON f.institution_id = i.id
    WHERE (
        (m.higher_is_better  AND m.warning_threshold IS NOT NULL AND f.value < m.warning_threshold) OR
        (NOT m.higher_is_better AND m.warning_threshold IS NOT NULL AND f.value > m.warning_threshold)
    )
    ON CONFLICT DO NOTHING;
END;
$$;

-- Run alerts on seed data
SELECT generate_alerts();


-- ============================================================
--  STEP 23 — REFRESH VIEWS
-- ============================================================
REFRESH MATERIALIZED VIEW mv_latest_kpis;
REFRESH MATERIALIZED VIEW mv_latest_kpis_by_dept;
REFRESH MATERIALIZED VIEW mv_domain_averages;
REFRESH MATERIALIZED VIEW mv_dept_comparison;
