-- ============================================================
--  SEED DATA (minimal for demo)
-- ============================================================

-- STEP 13 — DOMAINS
INSERT INTO dim_domain (code, name, name_fr, icon, color_hex, display_order) VALUES
('ACADEMIC',   'Academic',        'Académique',          '🎓', '#4F46E5', 1),
('FINANCE',    'Finance',         'Finance',             '💰', '#059669', 2),
('HR',         'Human Resources', 'Ressources Humaines', '👥', '#D97706', 3),
('ENROLLMENT', 'Enrollment',      'Inscription',         '📋', '#9333EA', 4);

-- STEP 14 — METRICS (core only)
INSERT INTO dim_metric (code, name, name_fr, domain_id, unit, aggregation, higher_is_better, warning_threshold, critical_threshold) VALUES
('ACAD_SUCCESS_RATE',    'Success Rate',        'Taux de réussite',             1, '%', 'AVG', TRUE,  70, 50),
('ACAD_DROPOUT_RATE',    'Dropout Rate',        'Taux d''abandon',             1, '%', 'AVG', FALSE, 10, 20),
('FIN_BUDGET_EXEC_RATE', 'Budget Execution',    'Taux d''exécution budgétaire', 2, '%', 'AVG', TRUE,  80, 60),
('HR_ABSENTEEISM_RATE',  'Absenteeism Rate',    'Taux d''absentéisme',         3, '%', 'AVG', FALSE, 5,  10),
('ENR_FILL_RATE',        'Program Fill Rate',   'Taux de remplissage',         4, '%', 'AVG', TRUE,  80, 60);

-- STEP 15 — TIME (2 semesters only)
INSERT INTO dim_time (full_date, day, month, month_name, quarter, semester, academic_year, year) VALUES
('2024-09-01', 1, 9,  'September', 3, 1, '2024-2025', 2024),
('2025-03-01', 1, 3,  'March',     1, 2, '2024-2025', 2025);

-- STEP 16 — INSTITUTIONS (3)
INSERT INTO dim_institution (code, name, short_name, city, region, institution_type, founding_year, student_capacity) VALUES
('ENSTAB', 'Ecole Nationale des Sciences et Technologies Avancees de Bizerte', 'ENSTAB', 'Bizerte',  'Nord',        'engineering', 2002, 2000),
('ENIM',   'Ecole Nationale d''Ingenieurs de Monastir',                        'ENIM',   'Monastir', 'Centre',      'engineering', 1987, 3000),
('ESCT',   'Ecole Superieure de Commerce de Tunis',                            'ESCT',   'Tunis',    'Grand Tunis', 'business',    1992, 1800);

-- STEP 17 — DEPARTMENTS (4)
INSERT INTO dim_department (institution_id, code, name, field, specialty, student_count, staff_count) VALUES
(1, 'IT',   'Information Technology', 'Engineering', 'IT',         410, 22),
(1, 'ELEC', 'Electrical Engineering', 'Engineering', 'Electrical', 320, 18),
(2, 'IT',   'Information Technology', 'Engineering', 'IT',         520, 28),
(3, 'MGT',  'Management',            'Business',    'Management', 450, 24);

-- STEP 18 — KPI DATA (institution-level, 2 semesters x 3 institutions x 5 metrics = 30 rows)
INSERT INTO fact_kpis (institution_id, time_id, metric_id, value, value_previous, source) VALUES
-- ENSTAB S1
(1, 1, 1, 78.50, 75.20, 'seed'), (1, 1, 2, 12.30, 10.10, 'seed'), (1, 1, 3, 85.40, 82.00, 'seed'), (1, 1, 4, 6.20, 5.80, 'seed'), (1, 1, 5, 88.00, 85.50, 'seed'),
-- ENSTAB S2
(1, 2, 1, 80.10, 78.50, 'seed'), (1, 2, 2, 11.50, 12.30, 'seed'), (1, 2, 3, 87.20, 85.40, 'seed'), (1, 2, 4, 5.90, 6.20, 'seed'), (1, 2, 5, 90.30, 88.00, 'seed'),
-- ENIM S1
(2, 1, 1, 72.00, 70.50, 'seed'), (2, 1, 2, 15.80, 14.20, 'seed'), (2, 1, 3, 79.00, 76.50, 'seed'), (2, 1, 4, 7.50, 6.90, 'seed'), (2, 1, 5, 82.40, 80.10, 'seed'),
-- ENIM S2
(2, 2, 1, 68.30, 72.00, 'seed'), (2, 2, 2, 18.20, 15.80, 'seed'), (2, 2, 3, 75.60, 79.00, 'seed'), (2, 2, 4, 8.90, 7.50, 'seed'), (2, 2, 5, 78.50, 82.40, 'seed'),
-- ESCT S1
(3, 1, 1, 82.70, 80.00, 'seed'), (3, 1, 2, 8.40, 9.10, 'seed'), (3, 1, 3, 91.20, 88.30, 'seed'), (3, 1, 4, 4.10, 4.50, 'seed'), (3, 1, 5, 92.00, 90.50, 'seed'),
-- ESCT S2
(3, 2, 1, 84.50, 82.70, 'seed'), (3, 2, 2, 7.90, 8.40, 'seed'), (3, 2, 3, 93.10, 91.20, 'seed'), (3, 2, 4, 3.80, 4.10, 'seed'), (3, 2, 5, 93.50, 92.00, 'seed');

-- STEP 19 — USERS (3)
INSERT INTO users (email, full_name, role, institution_id) VALUES
('admin@ucar.tn',            'UCAR Administrator', 'superadmin', NULL),
('president.enstab@ucar.tn', 'President ENSTAB',    'president',  1),
('analyst@ucar.tn',          'Data Analyst',        'analyst',    NULL);
