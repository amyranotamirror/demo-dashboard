# demo-dashboard

> A Claude Code slash command toolkit for building complete Holistics dashboards — from business concept to deployed AML — with approval gates at every step.

---

## Overview

This repo contains a set of Claude Code slash commands that guide you through the full dashboard development lifecycle. Each command covers one phase of the workflow, produces concrete file artifacts, and stops for your approval before moving to the next step.

The workflow is split into **5 phases**:

```
Phase 1 — Align      concept.md + prototype.html
Phase 2 — Design     schema.md + metric formulas
Phase 3 — Data       generate.js + CSVs + Neon sync
Phase 4 — Model      *.model.aml + *.dataset.aml
Phase 5 — Dashboard  *.page.aml (+ optional theme + custom charts)
```

You don't have to run all phases. Each command detects where you are and skips what's already done.

---

## Commands

| Slash command | What it does | Phases |
|---|---|---|
| `/build-complete-dashboard` | End-to-end orchestrator — runs all phases, links to sub-commands | 1–5 |
| `/modeling:build-data-model` | Concept doc → HTML prototype → schema → seed data → generate.js + CSVs → Neon sync | 1–3 |
| `/modeling:build-metric` | Design and write Holistics AML: dimensions, measures, metrics, full datasets | 4 |
| `/reporting:build-dashboard` | Write dashboard `.page.aml`: charts, layout, filters, interactions | 5 |
| `/reporting:build-custom-chart` | Build a Vega-Lite custom chart: HTML prototype → `CustomChart` AML | 5 |
| `/reporting:build-theme` | Design a dashboard theme: HTML preview → `PageTheme` AML | 5 |

---

## Prerequisites

- [Claude Code](https://claude.ai/code) (`npm install -g @anthropic-ai/claude-code`)
- Node.js — to run `generate.js` and `sync.js`
- [Neon](https://neon.tech) — PostgreSQL cloud database (free tier works)
- [Holistics](https://holistics.io) — BI platform where the AML gets deployed

---

## Quick start

```bash
git clone https://github.com/holistics/demo-dashboard.git
cd demo-dashboard
claude
```

Then in Claude Code:

```
/build-complete-dashboard
```

Claude will ask four questions (department, what you already have, theme preference, custom charts needed), then work through each phase with approval gates.

**Already partway through?** Run the relevant sub-command directly — each one starts with a step 0 intent check that skips what's already done.

---

## Output structure

Each dashboard lives in its own folder:

```
dashboards/<slug>/
  concept.md                  ← tab structure, users, metric funnel, Kettle ERD
  prototype.html              ← layout mockup — fake data, no AML
  schema.md                   ← star/galaxy schema + metric formula definitions
  seed-data-spec.md           ← row counts, story elements, enum weights
  data-script/
    generate.js               ← Node.js data generator (no npm install)
    postgres.sql              ← DDL + COPY statements for Neon
    sync.js                   ← incremental table re-sync without regenerating
  data/
    <table>.csv               ← one file per table
  relationships.aml           ← all relationship declarations
  <table>.model.aml           ← one model file per fact/dim table
  <name>.dataset.aml          ← dataset with metrics
  <name>.page.aml             ← dashboard layout, charts, filters
themes/<slug>/
  <slug>-v1.html              ← theme preview in browser
  <slug>-v1.aml               ← PageTheme AML
custom-chart/<slug>/
  <slug>-v1.html              ← chart variants side-by-side
  <slug>-v1.md                ← documentation + final AML
```

---

## Reference example

`dashboards/sales-dashboard/` is a complete Phase 1–3 execution for a B2B SaaS sales & customer lifecycle dashboard:

- 6 tabs: Overview, Pipeline, Performance, Market Signals, Relationship, Customer Health
- 12 tables, ~37,900 rows of synthetic data with story elements baked in (top deal blockers, competitor patterns, rep performance variance, at-risk accounts)

---

## Repo structure

```
demo-dashboard/
├── CLAUDE.md                            # Operating instructions (auto-loaded by Claude Code)
├── .claude/
│   └── commands/
│       ├── build-complete-dashboard.md  # Phase 1–5 orchestrator
│       ├── modeling/
│       │   ├── build-data-model.md      # Phases 1–3: concept → data → Neon
│       │   ├── build-metric.md          # Phase 4: AML models + datasets
│       │   └── _holistics-patterns.md   # Reference: schema patterns, naming, AQL
│       └── reporting/
│           ├── build-dashboard.md       # Phase 5: dashboard AML
│           ├── build-custom-chart.md    # Phase 5: Vega-Lite custom charts
│           ├── build-theme.md           # Phase 5: PageTheme AML
│           ├── _chart-prototype-template.html
│           └── _theme-preview-template.html
├── dashboards/
│   └── sales-dashboard/                 # Reference execution (Phases 1–3)
├── themes/                              # Generated theme files
└── custom-chart/                        # Generated custom chart files
```
