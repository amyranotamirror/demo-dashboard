# CLAUDE.md — demo-dashboard

This file tells Claude how to operate in this repository.

---

## What this repo is

A template for building internal analytics dashboards with synthetic demo data. The prompt and all design rules live in [`.claude/commands/build-dashboard.md`](.claude/commands/build-dashboard.md). The `sales-dashboard/` folder is a reference execution of that template.

---

## How to run the template

1. Read `.claude/commands/build-dashboard.md` in full before starting.
2. Ask the user for the placeholder values if they haven't been provided (`[COMPANY]`, `[DEPARTMENT]`, `[TABS]`, etc.).
3. Follow the execution protocol defined in that file exactly — produce one artifact at a time, stop after each, and wait for explicit user approval before continuing.
4. Place output files in a new folder at the repo root, mirroring the structure of `sales-dashboard/`.

The prompt file is the source of truth. Do not deviate from the entity design rules, schema constraints, and data generation requirements defined there.
