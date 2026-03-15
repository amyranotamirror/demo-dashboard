# Build a Complete Dashboard from Scratch

End-to-end workflow: business concept → layout prototype → data → Holistics AML → dashboard.

**Already partway through?** Jump to the right phase:
- Need only data model + seed data → `.claude/commands/modeling/build-data-model.md`
- Need only AML models/dataset/metrics → `.claude/commands/modeling/build-metric.md`
- Need only dashboard AML code → `.claude/commands/reporting/build-dashboard.md`
- Need only a custom chart → `.claude/commands/reporting/build-custom-chart.md`
- Need only a theme → `.claude/commands/reporting/build-theme.md`

---

## Quick scope check

Before starting, ask only:
1. What department / use case? (e.g., Sales pipeline, Finance budget, HR attrition)
2. What do you already have? (skip completed phases)
3. Custom theme or built-in? (`default`, `light`, `dark`, `hextech`, `forest`, `ocean`, `sunset`)
4. Any custom Vega-Lite charts, or built-in chart types sufficient?

---

## Phase 1 — Align on what you're building

**Command:** `.claude/commands/modeling/build-data-model.md` (Steps 1–2)

| Step | Output | Gate |
|---|---|---|
| 1 — Concept doc | `concept.md`: tabs, users, key questions, Kettle ERD (business alignment only), metric funnel | Approve before prototype |
| 2 — Layout prototype | `prototype.html`: tab layout, placeholder charts, fake KPIs — NO real data, NO AML | Approve layout + chart types before data work |

---

## Phase 2 — Make sense of the data

**Command:** `.claude/commands/modeling/build-data-model.md` (Step 3)

| Step | Output | Gate |
|---|---|---|
| 3 — Schema + metric formulas | `schema.md`: star/galaxy tables, columns, relationships, path ambiguity notes. Metric formulas: grain, numerator/denominator, edge cases. | Approve schema + formulas before building data |

---

## Phase 3 — Build the data

**Command:** `.claude/commands/modeling/build-data-model.md` (Steps 4–5)

| Step | Output | Gate |
|---|---|---|
| 4 — Seed data story spec | `seed-data-spec.md`: row counts, enum weights, 4–6 story elements | Approve story before generating |
| 5a — Data generation | `data-script/generate.js` + `data/*.csv` | Confirm data tells the story |
| 5b — Neon sync | `data-script/postgres.sql` + `data-script/sync.js` | Verify tables load correctly in Neon |

---

## Phase 4 — Build in Holistics

**Command:** `.claude/commands/modeling/build-metric.md`

Input: `schema.md` from Phase 2 + metric formulas

| Step | Output | Gate |
|---|---|---|
| Model files | `<table>.model.aml` per fact/dim table + `relationships.aml` | Confirm models before dataset |
| Dataset | `<name>.dataset.aml`: relationships, cross-model dims, metrics | Confirm dataset + metrics before dashboard |

---

## Phase 5 — Dashboard

Run each sub-command as needed. Order: theme (optional) → custom charts (optional) → dashboard AML.

| Step | Command | Output | Gate |
|---|---|---|---|
| Theme *(optional)* | `.claude/commands/reporting/build-theme.md` | HTML prototype → `PageTheme` AML | Approve prototype before AML |
| Custom charts *(optional)* | `.claude/commands/reporting/build-custom-chart.md` | HTML variants → `CustomChart` AML | Approve variant before AML |
| Dashboard AML | `.claude/commands/reporting/build-dashboard.md` | `<name>.page.aml` | Confirm matches prototype |

---

## Output folder structure

```
dashboards/<slug>/
  concept.md
  prototype.html
  schema.md
  seed-data-spec.md
  data-script/
    generate.js
    postgres.sql
    sync.js
  data/
    <table>.csv
  themes/<theme-slug>/
    <theme-slug>-v1.html
    <theme-slug>-v1.aml
  custom-chart/<chart-slug>/
    <chart-slug>-v1.html
    <chart-slug>-v1.md
  relationships.aml
  <table>.model.aml
  <name>.dataset.aml
  <name>.page.aml
```

---

## Progress checklist

```
Phase 1 — Align
  [ ] concept.md approved
  [ ] prototype.html approved

Phase 2 — Data design
  [ ] schema.md approved
  [ ] metric formulas approved

Phase 3 — Data build
  [ ] seed-data-spec.md approved
  [ ] generate.js + CSVs confirmed
  [ ] Neon tables loaded and verified

Phase 4 — Holistics AML
  [ ] model files confirmed
  [ ] dataset + metrics confirmed

Phase 5 — Dashboard
  [ ] theme approved (or built-in chosen)
  [ ] custom charts approved (or skipped)
  [ ] dashboard .page.aml confirmed
```
