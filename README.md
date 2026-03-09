# demo-dashboard

> A Claude Code toolkit for generating internal analytics dashboards — complete with data models, schema, and realistic synthetic data — for any department, in minutes.

---

## What is this?

This repo is a **reusable prompt template** that turns a short brief into a full analytics dashboard data package. You describe your department and use case; Claude designs the data model, generates the schema, and writes a Node.js script that produces realistic CSV data — ready to load into any BI tool.

**Who it's for:** Anyone who needs a working demo dashboard with coherent fake data and doesn't want to design the data model from scratch.

---

## What it produces

For each dashboard, Claude generates five artifacts — one at a time, with your approval at each step:

| Artifact | What it is |
|---|---|
| `concept.md` | Dashboard spec — tabs, widgets, filters, metrics |
| `schema.md` | Conceptual ERD + field definitions |
| `[slug].dbml` | Database schema, paste-ready for [dbdiagram.io](https://dbdiagram.io) |
| `seed-data-spec.md` | Row counts, enum weights, date rules |
| `data/generate.js` | Node.js script that outputs realistic CSV files — no `npm install` required |

---

## Prerequisites

- [Claude Code](https://claude.ai/code) installed (`npm install -g @anthropic-ai/claude-code`)
- Node.js (to run the generated `generate.js` script)

---

## How to use it

### 1. Clone the repo

```bash
git clone https://github.com/holistics/demo-dashboard.git
cd demo-dashboard
```

### 2. Open Claude Code

```bash
claude
```

### 3. Run the slash command

```
/build-dashboard
```

Claude will ask for a few inputs — company name, department, tabs, user types — then produce each artifact one at a time and wait for your approval before continuing.

### 4. Run the data generator

Once `data/generate.js` is ready:

```bash
cd your-dashboard-folder/data
node generate.js
```

This outputs one CSV per table. Load them into Holistics, Metabase, or any BI tool to build your dashboard.

---

## Works for any department

| Department | Example focus areas |
|---|---|
| Sales | Pipeline health, win/loss analysis, customer lifecycle |
| Finance | Budget tracking, spend vs. forecast, cost center health |
| HR / People Ops | Hiring pipeline, headcount, attrition signals |
| Customer Support | Ticket volume, SLA health, escalation patterns |
| Marketing | Campaign pipeline, lead conversion, channel attribution |
| Product | Feature adoption, feedback → roadmap loop |

---

## Reference example

`sales-dashboard/` is a complete execution of the template for a B2B SaaS sales & customer lifecycle dashboard at Holistics. It includes:

- A 6-tab dashboard concept (Overview, Pipeline, Performance, Market Signals, Relationship, Customer Health)
- A 10-entity conceptual schema with 12 physical tables
- A generator script that produces ~37,900 rows across 12 CSV files, with story elements baked in (top deal blockers, competitor patterns, a churned rep's impact on win rate, etc.)

See `sales-dashboard/` for the full output and `.claude/commands/build-dashboard.md` for the prompt that produced it.

---

## Repo structure

```
demo-dashboard/
├── CLAUDE.md                        # Auto-loaded by Claude Code — operating instructions
├── .claude/
│   └── commands/
│       └── build-dashboard.md       # The full prompt template (slash command)
└── sales-dashboard/                 # Reference execution for a sales dashboard
    ├── 1-concept.md
    ├── 2-schema.md
    ├── 3-seed-data-spec.md
    ├── data-script/
    │   ├── sales-pipeline.dbml
    │   └── generate.js
    └── raw-data/                    # Generated CSVs
```
