# Prompt: Internal Analytics Dashboard — Data Model & Demo Dataset

## How to reuse this prompt

This prompt is a template. Replace the **`[PLACEHOLDERS]`** below to adapt it to a different department or use case. The structure — entity design principles, schema format, DBML output, seed data pattern, CSV generator — stays the same.

**Variables to change:**

| Placeholder | What to fill in | Example (original) |
|---|---|---|
| `[COMPANY]` | Your company name | Holistics |
| `[PRODUCT TYPE]` | What the company sells | B2B analytics SaaS |
| `[DEPARTMENT]` | The team this dashboard serves | Sales & Customer Lifecycle |
| `[PRIMARY_USERS]` | Who uses it daily for operational decisions | Sales reps · Sales managers |
| `[SECONDARY_USERS]` | Who consumes specific tabs for strategic use | Product team · CS reps · BizOps |
| `[DOMAIN]` | The business domain or process being tracked | B2B sales pipeline and post-sale retention |
| `[LIFECYCLE_STEPS]` | Key stages in this domain's lifecycle | Prospect → Deal → Won → Subscription → Churn |
| `[CORE_QUESTION]` | The one question the dashboard answers | Are we winning the right deals and keeping customers? |
| `[TABS]` | Tab names and their focus areas | Overview · Pipeline · Performance · Market Signals · Relationship · Customer Health |
| `[OUT_OF_SCOPE]` | Explicitly excluded areas | Marketing channel analytics, product usage telemetry |

**Other departments this template works for:**
- **Finance:** Budget tracking, spend vs. forecast, cost center health
- **HR / People Ops:** Hiring pipeline, headcount, attrition signals
- **Customer Support:** Ticket volume, SLA health, agent performance, escalation patterns
- **Marketing:** Campaign pipeline, lead conversion, channel attribution
- **Product:** Feature adoption, usage health, feedback → roadmap loop

---

## Role / Context

You are a data modeler and PM embedded in **[COMPANY]**'s **[DEPARTMENT]** team. **[COMPANY]** sells a **[PRODUCT TYPE]**. You understand the full **[DOMAIN]** lifecycle — from **[LIFECYCLE_STEPS]**.

## Objective

Design an implementation-ready data model for a **[DEPARTMENT]** internal analytics dashboard covering the full **[DOMAIN]** lifecycle. The dashboard is a **demo** — all data will be synthetic.

Produce five artifacts:
1. **`concept.md`** — business concept doc
2. **`schema.md`** — entity relationship diagram (Mermaid ERD) + relationship table + field definitions
3. **`[slug].dbml`** — DBML schema, paste-and-render ready at [dbdiagram.io](https://dbdiagram.io)
4. **`seed-data-spec.md`** — seed data guide (row counts, enum weights, date rules)
5. **`data/generate.js`** — Node.js script that generates CSV files (one per table) with realistic fake data telling a coherent story

## Execution Protocol

**Stop after each artifact. Do not proceed to the next step until the user explicitly confirms.**

After completing each artifact, output a summary of what was produced and ask:
> "Ready to move on to [next artifact name]? Any changes before we continue?"

Only proceed when the user says something like "yes", "continue", "looks good", or equivalent confirmation. If the user requests changes, apply them and re-confirm before moving on.

Artifact order and gate points:
1. `concept.md` → **STOP. Wait for approval.**
2. `schema.md` → **STOP. Wait for approval.**
3. `[slug].dbml` → **STOP. Wait for approval.**
4. `seed-data-spec.md` → **STOP. Wait for approval.**
5. `data/generate.js` + CSV files → **STOP. Wait for final review.**

## Background

**[DEPARTMENT]** needs structured visibility into:

*[List 4–8 specific visibility gaps. Be concrete about what they currently can't see.]*

- [Gap 1 — e.g. "Deal progress across stages — what's active, stalled, or ghosted"]
- [Gap 2 — e.g. "Why deals are lost — missing feature, pricing friction, competitor wins"]
- [Gap 3 — e.g. "Customer health — engagement signals, open issues, renewal risk"]
- [Gap 4 — e.g. "Product gaps surfaced through customer conversations"]

## Users

**Primary:** [PRIMARY_USERS] — use the dashboard daily for operational decisions

**Secondary:** [SECONDARY_USERS] — consume specific tabs for strategic or support purposes

## Dashboard Structure

**[TABS]** — one tab per audience / business question.

Each tab must answer a specific business question and connect to adjacent tabs to tell a causal story (e.g. win rate drops → funnel shows bottleneck at stage X → market signals show top blocker → product ships fix → follow-up needed).

Each tab definition should include:
- Primary user
- Key question it answers
- Filters available
- Widget list with type and description

## Entity Design Principles

Follow **Kettle design rules** for entity modeling. These rules apply to both the Mermaid ERD in `schema.md` and the DBML in `[slug].dbml`.

### Kettle Rule 1 — Entities are domain objects only
Only model entities that represent real-world business objects a human would recognize: Company, Deal, Person, Subscription, etc.

**Not allowed as standalone entities:**
- **Junction / association tables** (e.g. `call_attendees`, `deal_tags`): these are physical join tables. Document them as a note inside the parent entity instead.
- **Snapshot / history tables** (e.g. `deal_stage_history`, `subscription_renewals`): these are physical audit trails. Document them as a note inside the parent entity instead.

**How to document physical tables inside a parent entity:**
```
Entity: Deal
  Fields: ...
  Physical notes:
    - deal_stage_history (deal_id, stage, entered_at, exited_at) — tracks stage transitions; exited_at = NULL means current stage
```

### Kettle Rule 2 — The ERD represents the conceptual model, not the database schema
The diagram should show how business objects relate to each other, not every table that will be created in Postgres. Reviewers should be able to understand the business domain from the diagram without knowing SQL.

### Kettle Rule 3 — Unified tables over split tables
Where two things differ only by channel or source (e.g. call signals vs. support tickets), merge them into one table with a `source` field differentiating them.

### Kettle Rule 4 — No redundant fields
If a value is already derivable from an existing FK chain, don't add a separate field for it. For example, don't add `is_internal` to persons if `company.type = 'us'` already tells you.

## Schema Design Constraints

- DBML syntax must follow [dbdiagram.io](https://dbdiagram.io) spec — paste-and-render ready
- **Avoid over-normalisation** — if a lookup table adds no analytical value, inline it as an enum
- **Support history** — for entities with state changes, use a snapshot table: `(entity_id, state, entered_at, exited_at)` where `exited_at = NULL` means currently in that state. Time in state = `COALESCE(exited_at, now()) - entered_at`
- **Denormalize deliberately** — e.g. `company_id` on `raw_inputs` for direct queries. Document these explicitly
- **Flag path ambiguity** — for every denormalized FK that creates multiple join paths to the same table, document which path to register and which to omit in the Holistics dataset. See [Holistics path ambiguity docs](https://docs.holistics.io/docs/dataset-path-ambiguity)
- For categorical fields that fakerjs cannot generate accurately, define them as enums

## Product / Signal Taxonomy (if applicable)

If the domain involves customer feedback connecting to product or operational capabilities, model a taxonomy:

```
Raw Inputs → Improvement → Feature → Use Case → Theme
(many per customer)   (team clusters them)   (solution built)   (problem group)   (strategic area)
```

- **Improvement** = the team's synthesis of multiple raw signals into one named customer problem, with specific requirements
- **Feature** = what's actually built; has lifecycle status and shipped date
- When a Feature ships → linked Improvements with `status = shipped` should trigger follow-up

## Seed Data — Incremental Date Pattern

All dates must use an offset so demo data always feels current:

```js
// In generate.js — dates stay fresh regardless of when you run the script
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
```

Use `daysAgo(n)` to express all dates relatively (e.g. `daysAgo(90)` = "3 months ago today"). No hardcoded year values.

## Data Generation Script Requirements

The `data/generate.js` script must:
- Use **Node.js built-ins only** — `crypto.randomUUID()`, `fs`, `path`. No `npm install`
- Output **one CSV per table** to the same `data/` folder
- Maintain **referential integrity** — all FKs must reference valid rows in parent tables
- Maintain **chronological integrity** — dates must be logically ordered within and across entities
- Tell a **coherent story** — bake in the insights the dashboard should surface. Decide on 4–6 story elements before writing the script. Examples:
  - A specific product gap that's the #1 deal blocker (shows in Market Signals)
  - A competitor that keeps appearing in lost deals (shows in Competitor Displacement)
  - A pipeline stage where deals disproportionately drop off
  - 3–5 at-risk accounts with no recent contact
  - A feature that recently shipped, triggering follow-up needed (Promise Tracker)
  - One team member with notably higher or lower performance (for coaching view)

## Metrics

Structure metrics as a **causal chain**, not a flat list. The chain should match the domain lifecycle:

```
[Stage 1: Build/Fill] → [Stage 2: Convert/Close] → [Stage 3: Understand/Why] → [Stage 4: Retain/Grow]
```

Each metric: name · what it tells you · SQL pseudocode formula.
Prefer metrics that require joining multiple tables or aggregating history — these demonstrate the model's analytical value.

## Out of Scope

**[OUT_OF_SCOPE]**

---

## Execution Log

*Fill this in as artifacts are generated:*

- [ ] `concept.md`
- [ ] `schema.md`
- [ ] `[slug].dbml`
- [ ] `seed-data-spec.md`
- [ ] `data/generate.js` + CSV files

---

## Original Execution — Sales Dashboard (Holistics, 2026)

**Filled values:**
- **[COMPANY]:** Holistics · **[PRODUCT TYPE]:** B2B analytics SaaS
- **[DEPARTMENT]:** Sales & Customer Lifecycle
- **[PRIMARY_USERS]:** Sales reps · Sales managers
- **[SECONDARY_USERS]:** Product team (Market Signals tab) · CS reps (Relationship & Health tabs) · BizOps
- **[DOMAIN]:** B2B SaaS sales pipeline and post-sale retention
- **[LIFECYCLE_STEPS]:** Company Identified → Deal Created → Qualifying → Validating → Progressing → Focus → Negotiating → Won → Subscription → Renew or Churn
- **[TABS]:** Overview · Pipeline · Performance · Market Signals · Relationship · Customer Health
- **[OUT_OF_SCOPE]:** Marketing channel analytics, product usage telemetry

**Story elements baked into the data:**
- SSO via SAML is the #1 deal blocker (14 raw inputs, blocking 4+ active deals at Validating stage)
- Excel export is the most-requested improvement (18 raw inputs, no feature built yet)
- Metabase is the most-mentioned competitor (~25% of competitor-tagged raw inputs)
- Pipeline bottleneck at Validating stage (highest drop-off in stage conversion funnel)
- Column masking recently shipped → follow-up needed for 9 affected customers (Promise Tracker)
- Sarah Chen (AE, highest win rate) departed at month ~30 → visible win rate dip in that quarter
- James Wilson (newest AE) is still ramping — lower win rate, smaller pipeline

**Artifacts:**

| File | Description | Status |
|---|---|---|
| `concept.md` | 6-tab dashboard, widget + filter definitions, Mermaid lifecycle diagram, 4-stage metric funnel, role walkthroughs with example scenarios | ✅ Done |
| `schema.md` | Mermaid ERD, relationship table, 4 path-ambiguity collision notes, field definitions for 10 conceptual entities + 12 physical tables | ✅ Done |
| `data-script/sales-pipeline.dbml` | 12 tables, enums, inline refs. Paste into [dbdiagram.io](https://dbdiagram.io) to render | ✅ Done |
| `seed-data-spec.md` | Row counts, deal cohort guide (6 cohorts × 4 years), enum weights, product taxonomy, date sequencing rules | ✅ Done |
| `data-script/generate.js` | Node.js generator — no external deps, runs with `node generate.js`. Outputs 12 CSVs to `../data/` and `postgres.sql` to `data-script/` | ✅ Done |
| `data/*.csv` | 12 CSV files, ~37,900 rows total: 248 companies · 717 persons · 709 deals · 2,308 calls · 23,924 raw inputs · 349 subscriptions + history/junction tables | ✅ Done |
| `data-script/postgres.sql` | ~7.6 MB. Full DDL + batched INSERT statements. Paste into [RunSQL](https://runsql.com) → PostgreSQL | ✅ Done |

**Schema changes from initial design:**
- `deals`: added `follow_up_at` (date a ghost/paused deal should be reactivated)
- `persons`: added `left_at` (models team turnover over 4-year history)
- `companies`: added `logo_url` (Clearbit format for real companies)
- `subscriptions`: added `term_months` (contract length, independent of billing cycle)
- `deals.deal_type`: corrected from `new_business`/`expansion` → `new`/`upgrade`/`downgrade`/`renewal`
- `deals.stage`: corrected from activity-based labels → `qualifying`/`validating`/`progressing`/`focus`/`negotiating`
- `raw_inputs.input_type`: corrected enum values to match schema (e.g. `bug`, `how_to`, `deal_breaker`)
- Internal team expanded to 26 people (added `product`, `data_analyst`, `ceo`, `cto` roles)
- Real named companies (Grab, Gojek, Shopee, etc.) seeded exactly as specified

**What's not done (out of scope):**
- [ ] Marketing channel analytics
- [ ] Product usage telemetry (post-sale feature adoption tracking)
- [ ] Actual dashboard/report builds in Holistics
- [ ] Automated seed script refresh via CI
