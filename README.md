# demo-dashboard

A reusable template for building internal analytics dashboards with implementation-ready data models and synthetic demo datasets — powered by Claude.

---

## How to use

1. Open this repo in Claude Code
2. Run `/build-dashboard` in the chat
3. Claude will ask for your context (company, department, users, lifecycle, tabs) and walk you through producing five artifacts, one at a time:

| Artifact | What it is |
|---|---|
| `concept.md` | Dashboard spec — tabs, widgets, filters, metrics |
| `schema.md` | Conceptual ERD + field definitions |
| `[slug].dbml` | Database schema, paste-ready for [dbdiagram.io](https://dbdiagram.io) |
| `seed-data-spec.md` | Row counts, enum weights, date rules |
| `data/generate.js` | Node.js script that generates realistic CSV files |

Claude stops after each artifact and waits for your approval before continuing.

---

## Works for any department

- **Sales** — pipeline, win/loss, customer health
- **Finance** — budget tracking, spend vs. forecast
- **HR / People Ops** — hiring pipeline, headcount, attrition
- **Customer Support** — ticket volume, SLA health, escalation patterns
- **Marketing** — campaign pipeline, lead conversion, channel attribution
- **Product** — feature adoption, feedback → roadmap loop

---

## Reference example

`sales-dashboard/` contains a complete execution of the template for a B2B SaaS sales & customer lifecycle dashboard. See `sales-dashboard/0-prompt.md` for the filled-in prompt that produced it.
