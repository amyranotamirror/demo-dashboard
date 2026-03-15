# Build Data Model & Demo Dataset

Full workflow for going from a business idea to a ready-to-use demo dashboard dataset.

**Covers:** concept doc → layout prototype → schema design → seed data → data generation → Neon sync

For writing Holistics AML (models, datasets, metrics), use `.claude/commands/modeling/build-metric.md` after this workflow.

---

## Step 0 — Detect intent

Ask only what's needed:

1. **Where are you starting from?**
   - Starting from scratch → run all steps
   - Already have a concept doc → start from Step 2
   - Already have a schema → start from Step 4
   - Just need data refresh → start from Step 5a

2. **Which deliverables do you need?** (skip anything already done)
   - [ ] Concept doc + Kettle ERD
   - [ ] Dashboard layout prototype (HTML)
   - [ ] Schema + metric formula definitions
   - [ ] Seed data story spec
   - [ ] generate.js + CSVs
   - [ ] Neon DDL + sync workflow

---

## Step 1 — Concept doc

**Purpose:** Business alignment. Not for schema design.

Produce `concept.md` with:

### 1a — Context
- Company, product type, department
- Dashboard purpose: the one question it answers
- Primary users (daily operational) + secondary users (strategic)
- Out of scope

### 1b — Dashboard structure
For each tab:

| Field | Content |
|---|---|
| Tab name | — |
| Primary user | who opens this tab daily |
| Key question | the one question it answers |
| Filters | filter controls available |
| Widgets | list with type (KPI, LineChart, DataTable, etc.) and description |

Tabs must form a **causal chain** — each tab should connect to adjacent ones so the story flows (e.g., win rate drops → funnel shows bottleneck → market signals show root cause).

### 1c — Kettle ERD (Mermaid)

Draw the conceptual entity relationship diagram. Kettle rules:
- **Entities are domain objects only** — things a business user would recognize (Deal, Company, Person, Subscription)
- **No junction tables, no history/snapshot tables** as entities — document those as physical notes inside the parent entity
- **Unified tables over split** — merge things that differ only by channel/source (use a `type` field instead)
- **No redundant fields** — don't add a field if it's derivable from an FK chain

> ⚠️ **This ERD is for business alignment only.** Do not use Kettle entity rules to design the actual database schema. The real schema (Step 3) will use star/galaxy patterns optimized for query performance.

### 1d — Metric funnel (causal chain)
Structure as: `[Stage 1: Fill] → [Stage 2: Convert] → [Stage 3: Why] → [Stage 4: Retain]`

Each metric: name · what it tells you · rough formula.

**→ STOP. Wait for approval before Step 2.**

---

## Step 2 — Dashboard layout prototype

**Purpose:** Validate usability before touching data. A dashboard nobody uses is a dead dashboard.

Produce `prototype.html` — a simple HTML mockup showing:
- Tab navigation (all tabs from concept.md)
- For each tab: approximate layout with placeholder elements:
  - **KPI cards** — fake but realistic numbers (e.g., "$1.2M", "234 deals", "67%")
  - **Chart placeholders** — colored rectangles labeled with chart type and metric name (e.g., "LineChart: Monthly Revenue")
  - **Filter controls** — labeled dropdowns/date pickers (non-functional, visual only)
  - **Data tables** — column headers + 3–4 fake rows with realistic values

Implementation rules:
- Inline CSS + minimal JS for tab switching — no external dependencies
- Focus on **layout and information hierarchy**, not visual polish
- Fake numbers must be realistic for the domain (sales dashboard ≠ HR dashboard numbers)
- No Vega-Lite, no AML, no real data
- Each chart placeholder should show: chart type + metric name + dimensions used

This prototype answers: *"Is this the right layout? Do we have the right charts? Is anything missing or confusing?"*

**→ STOP. Wait for approval on layout and chart types before Step 3.**

---

## Step 3 — Schema design + metric formula definitions

**Purpose:** Move from usability to accuracy. Design the query-optimized schema.

Reference: `.claude/commands/modeling/_holistics-patterns.md` for pattern selection, naming, and relationship rules.

### 3a — Schema design

Produce `schema.md` with:

**1. Pattern choice** — star / galaxy / snowflake (and why)

**2. Table list**

| Table | Type | Description |
|---|---|---|
| `fct_orders` | fact | one row per order |
| `dim_users` | dimension | one row per user |
| ... | | |

**3. Column definitions** for each table:
- Column name (snake_case)
- Type
- Notes (FK target, enum values, nullable)
- `hidden: true` for FK/technical fields

**4. Relationship map**
- List all relationships: `fct_orders.user_id > dim_users.id`
- Note filter direction for each: `one_way` or `two_way`
- Flag any path ambiguity (multiple routes to same table)

**5. Physical tables** (not in the ERD but needed in the DB):
- Junction tables: `(parent_id, child_id, ...)`
- History/snapshot tables: `(entity_id, state, entered_at, exited_at)` where `exited_at = NULL` is current state

**Note on the Kettle ERD vs this schema:** The Kettle ERD shows conceptual entities. This schema shows the actual tables you'll create. They will differ — the schema may have more tables (staging, history), different naming, and is structured for query performance, not business readability.

### 3b — Metric formula definitions

For each metric from concept.md, document:

```
Metric: [name]
Plain definition: [one sentence, no technical terms]
Grain: one row = [what]
Formula:
  Numerator: count of [what] where [conditions]
  Denominator: count of [what] where [conditions]  (if ratio)
Time dimension: [field] on [table]
Always-on filters: [e.g., status != 'test']
Edge cases:
  - Denominator = 0? → safe_divide()
  - No data for period? → null or 0?
  - Multiple join paths to [table]? → which one is correct?
Required tables: [list]
```

**→ STOP. Wait for approval on schema and metric formulas before Step 4.**

---

## Step 4 — Seed data story spec

**Purpose:** Define the narrative the data should tell — so the dashboard surfaces real insights, not random noise.

Produce `seed-data-spec.md` with:

### Row counts per table
Enough to make charts non-trivial (e.g., 200+ companies, 500+ deals, 3000+ events).

### Story elements (4–6 specific narratives)
Each story element should be visible in at least one dashboard chart. Examples:
- A specific product gap that's the #1 deal blocker (shows in Market Signals)
- A competitor appearing in 25%+ of lost deals (shows in competitor analysis)
- A funnel bottleneck at one specific stage (shows in conversion funnel)
- 3–5 at-risk accounts with no recent contact (shows in health/relationship tab)
- A feature recently shipped → follow-up needed for affected customers (shows in promise tracker)
- One team member with notably higher/lower performance (shows in performance tab)

### Enum weights
For categorical fields, specify realistic distributions. Example:
```
deal.stage: qualifying 30%, validating 20%, progressing 20%, focus 10%, negotiating 10%, won 8%, lost 2%
deal.lost_reason: price 40%, competitor 30%, no_budget 20%, missing_feature 10%
```

### Date rules
All dates use incremental offset — no hardcoded years. Use a `daysAgo(n)` helper function throughout.

**→ STOP. Wait for approval on the story before Step 5a.**

---

## Step 5a — generate.js + CSVs

Produce `data-script/generate.js`:

**Rules:**
- Node.js built-ins only: `crypto.randomUUID()`, `fs`, `path` — no `npm install`
- One CSV per table, output to `data/` folder
- Referential integrity: all FKs reference valid parent rows
- Chronological integrity: dates logically ordered within and across entities
- All story elements from Step 4 baked in
- Use `daysAgo(n)` for all dates — no hardcoded year values

**Before writing the script**, list the story elements and how they'll be implemented (e.g., "SSO gap: 14 raw_inputs with theme='sso', linked to 4 active deals at validating stage"). Confirm this plan before generating 500+ lines of script.

**→ STOP. Wait for approval that data tells the right story.**

---

## Step 5b — Neon sync + update workflow

Produce `data-script/postgres.sql` and `data-script/sync.js`.

### postgres.sql
Full DDL for all tables: `CREATE TABLE IF NOT EXISTS` with proper types, constraints, and indexes. Include `COPY <table> FROM '<path>.csv' DELIMITER ',' CSV HEADER;` statements to load each CSV.

### sync.js — incremental update script

For when you edit a CSV and need to re-sync just that table without regenerating everything. Usage: `node sync.js <table_name>`. Reads `data/<table_name>.csv` → truncates table → reloads from CSV. Connection via `DATABASE_URL` env var (uses `pg` package).

**Update workflow:**
1. Edit the relevant CSV in `data/` directly (fix a row, add records, change values)
2. Run `node sync.js <table_name>` to truncate + reload just that table
3. No need to re-run `generate.js` for small fixes

**Neon setup checklist:**
- [ ] Create project at neon.tech
- [ ] Copy `DATABASE_URL` from Neon dashboard → `.env`
- [ ] Run `postgres.sql` to create tables and load initial data
- [ ] Verify row counts match expected totals from seed spec

