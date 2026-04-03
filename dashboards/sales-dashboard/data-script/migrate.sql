-- ============================================================
-- Sales Dashboard — Holistics Migration
-- Run this ONCE against Neon before syncing Holistics models.
-- Safe to re-run: all statements use CREATE OR REPLACE VIEW.
-- Does NOT modify any existing tables or data.
-- ============================================================

-- -----------------------------------------------------------
-- Role-playing split: companies table
-- Holistics needs separate table pointers to model the same
-- physical table in two different semantic roles.
-- -----------------------------------------------------------

-- Prospects and customers (fact participants)
CREATE OR REPLACE VIEW v_customers AS
  SELECT *
  FROM companies
  WHERE type IN ('internal', 'prospect', 'customer');

-- Competitors (referenced in raw_inputs only — never a deal participant)
CREATE OR REPLACE VIEW v_competitors AS
  SELECT *
  FROM companies
  WHERE type = 'competitor';

-- -----------------------------------------------------------
-- Role-playing split: persons table
-- Internal Holistics team vs. external contacts at prospects/customers.
-- Determined by the company they belong to (type = 'internal').
-- -----------------------------------------------------------

-- Internal reps: ae, cs_rep, sdr, manager, bizops, product, data_analyst, ceo, cto
CREATE OR REPLACE VIEW v_reps AS
  SELECT p.*
  FROM persons p
  JOIN companies c ON p.company_id = c.id
  WHERE c.type = 'internal';

-- External contacts: champion, decision_maker, evaluator, end_user
CREATE OR REPLACE VIEW v_contacts AS
  SELECT p.*
  FROM persons p
  JOIN companies c ON p.company_id = c.id
  WHERE c.type != 'internal';

-- -----------------------------------------------------------
-- Flattened product taxonomy
-- Avoids a 4-join snowflake chain (improvements → features →
-- use_cases → themes) in the Market Signals dataset.
-- improvements.feature_id joins to this view's id column.
-- -----------------------------------------------------------

CREATE OR REPLACE VIEW v_product_taxonomy AS
  SELECT
    f.id                AS id,
    f.use_case_id       AS use_case_id,
    f.name              AS feature_name,
    f.description       AS feature_description,
    f.status            AS feature_status,
    f.shipped_at        AS feature_shipped_at,
    uc.name             AS use_case_name,
    uc.description      AS use_case_description,
    t.id                AS theme_id,
    t.name              AS theme_name,
    t.description       AS theme_description
  FROM features f
  JOIN use_cases uc ON f.use_case_id = uc.id
  JOIN themes    t  ON uc.theme_id   = t.id;
