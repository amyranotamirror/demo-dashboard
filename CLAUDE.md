# CLAUDE.md — demo-dashboard

This file tells Claude how to operate in this repository.

---

## What this repo is

A workspace for building Holistics analytics dashboards with synthetic demo data. Command files live in `.claude/commands/`, organized by domain.

The `dashboards/sales-dashboard/` folder is a complete reference execution of the data model template.

---

## How Claude responds to requests

| User wants to... | Follow this command |
|---|---|
| Build a complete dashboard from scratch (no data, no schema) | `.claude/commands/build-complete-dashboard.md` |
| Go through concept → prototype → schema → data → Neon sync | `.claude/commands/modeling/build-data-model.md` |
| Build a metric, dimension, measure, or full dataset (design → AML code) | `.claude/commands/modeling/build-metric.md` |
| Build a Holistics dashboard (built-in charts, layout, filters) | `.claude/commands/reporting/build-dashboard.md` |
| Create a custom chart (Vega-Lite) | `.claude/commands/reporting/build-custom-chart.md` |
| Design or preview a dashboard theme (brand colors, fonts, CSS) | `.claude/commands/reporting/build-theme.md` |

---

## Command file structure

```
.claude/commands/
  build-complete-dashboard.md       ← end-to-end orchestrator (phases 1–5)
  reporting/
    build-dashboard.md              ← Holistics AML: charts, layout, filters
    build-custom-chart.md           ← Vega-Lite custom charts (prototype → AML)
    build-theme.md                  ← dashboard themes (prototype → PageTheme AML)
    _chart-prototype-template.html  ← base HTML template for custom chart previews
    _theme-preview-template.html    ← base HTML template for theme previews
  modeling/
    build-data-model.md             ← concept → prototype → schema → seed data → CSVs → Neon sync
    build-metric.md                 ← design + build dimensions / measures / metrics / full dataset AML
    _holistics-patterns.md          ← reference: modeling patterns, naming, fan-out, path ambiguity, filter direction
```

---

## General rules

- **Read the relevant command file before starting any task** — it contains the full workflow, step-by-step instructions, and output specs.
- **Stop after each artifact and wait for explicit user approval** before continuing. This applies to all commands that produce multiple sequential outputs.
- **Each command starts with a Step 0 intent check** — ask what the user already has and what deliverables they need. Skip questions already answered.
- **Place output files in a new folder** at the repo root (e.g. `dashboards/<slug>/`), mirroring the structure of `dashboards/sales-dashboard/`.
- **Update internal cross-references** if you move or rename any command file — all paths use `.claude/commands/...` format.
