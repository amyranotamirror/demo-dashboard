# Sales Dashboard — Prototype v11 Blueprint

> **Purpose:** Crystallized reference so future sessions can continue from v11 without re-reading 975 lines of HTML.
> **File:** `dashboards/sales-dashboard/prototype-v11.html`
> **Status:** Complete — awaiting user review before any v12 iteration.

---

## Design Principles (v11)

| Principle | Implementation |
|---|---|
| Z-pattern reading flow | KPIs (top-left→right) → status strip → charts (mid-row) → analysis tables (bottom) |
| Exec-first density | 6 KPIs in one grid row, 22px font, 3 data lines per card |
| No duplicate components | Pipeline: one deals table only (removed deal cards from v10) |
| No JS drawers | Deal detail is inline drill-through panel below table, not a slide-out overlay |
| Scalable data patterns | Tables replace accordions/swimlane cards for large datasets |
| Insight-first titles | Every chart card title is a declarative insight, not a label |

---

## Architecture

### CSS variables (dark theme)
```
--bg #0d1117  --bg-card #161b27  --bg-card2 #1a2030
--green #00c47a  --blue #3b82f6  --amber #f59e0b  --red #ef4444
--t1 #e2e8f0  --t2 #94a3b8  --t3 #475569
```

### Key CSS component classes
| Class | Purpose |
|---|---|
| `.kstrip.k6 / .k5 / .k4` | Compact KPI strip grid (6/5/4 columns) |
| `.ks / .ks-val / .ks-sub / .ks-delta` | Individual KPI cell structure |
| `.ss.green / .amber / .red` | Status strip with dot indicator |
| `.signal-row` + `.sig-chip.sig-red/amber/green/dim` | Pipeline signal filter row |
| `.deal-detail` + `.deal-detail.visible` | Inline drill-through panel (hidden by default) |
| `.tbl` + `.tbl-compact` | Tables — compact variant reduces padding |
| `.tr-critical / .tr-watch / .tr-ok` | Left-border color coding on account health rows |
| `.pill-ghost / -attention / -closeable / -healthy` | Signal status pills |
| `.sbadge-ship / -fly / -back` | Feature status badges (Shipped/In flight/Backlog) |
| `.funnel-stage / .funnel-bar-wrap / .funnel-bar` | Pure CSS funnel (no canvas) |
| `.rep-card / .rep-wr / .rep-bar-wrap` | Compact rep scorecard |
| `.ct` + `.ct-ri / .ct-ri-item` | Call accordion + raw inputs section inside deal detail |
| `.fbadge` | ⚡ Focus badge (amber tint, inline) |
| `.sguide` | Collapsible stage guide (Pipeline tab) |
| `.grid.g2/g3/g12/g21` | 2-col, 3-col, 1:2, 2:1 grid layouts |

### JS functions
| Function | What it does |
|---|---|
| `switchTab(n)` | Shows/hides `.tab-pane` by index, updates `.tab-btn.active` |
| `filterBySignal(sig)` | Filters `#deals-tbody tr` by `data-signal` attribute |
| `selectDeal(row)` | Populates `#deal-detail` from `dealData[id]`, adds `.visible` |
| `closeDealDetail()` | Removes `.visible` from `#deal-detail`, clears `.selected` |

### Chart.js canvases
| ID | Tab | Type | Description |
|---|---|---|---|
| `c0_wonlost` | Overview | Stacked bar | Won vs Lost by month (Oct–Mar) |
| `c0_wr` | Overview | Line (mini) | Win rate trend + 40% target dashed |
| `c0_nrr` | Overview | Line (mini) | NRR trend + 100% target dashed |
| `c0_lost` | Overview | Horizontal bar | Lost reasons by % |
| `c2_lost` | Win/Loss | Horizontal bar | Lost reasons (same data) |
| `c2_time` | Win/Loss | Horizontal bar | Avg days per stage |
| `c2_wintrend` | Win/Loss | Multi-line | Win rate by segment (SMB/MM/Ent) |
| `c3_mrr` | Customers | Stacked bar + line | MRR waterfall + net MRR line |
| `c3_nrr` | Customers | Line | NRR trailing 90d + 100% target |

---

## Tab Structure

### Tab 0 — Overview (exec single-page)
```
[6-KPI strip: Closed Revenue · Win Rate · Active Pipeline · Ghost Rate · NRR · Avg Cycle]
[Status strip: amber — key risks summary]
[g3 grid]
  [Funnel: Q→V→P→Won (pure CSS, no canvas)]
  [Won/Lost monthly bars chart]
  [Win rate mini + NRR mini (stacked in one card)]
[g12 grid]
  [Lost reasons bar chart]
  [Rep performance table: Win Rate · $ Won · Open deals · Ghost rate · Trend]
```

**Key numbers:** $412K closed / $520K quota · 34% win rate · $1.66M pipeline · 14% ghost · 94% NRR · 38d cycle

### Tab 1 — Pipeline (operational)
```
[Status strip: amber — 4 deals need action today]
[Stage guide collapsible: Q→V→P stages + Focus as overlay]
[Signal row: 🔴 2 Ghost · 🟡 2 Attention · 🟢 2 Closeable · 3 Healthy — click to filter]
[Deals table: Signal | Company | Stage | Value | Days in stage | Last activity | Blockers | Next step | Owner]
  (7 sample rows of 67; data-deal and data-signal attributes on each tr)
[deal-detail div: hidden until row clicked, populates with JS, shows meta + contacts + call accordions]
```

**Deal data in JS (`dealData` object):**
- `healthtrack` — $67K · Closeable · Sarah · 67d open · 4 calls (Discovery→Demo→Technical Onboarding→Business User Onboarding)
- `databridge` — $42K · Attention (⚡ Focus) · Sarah · 42d · 3 calls · SSO/SAML + audit log blocker
- `meridian` — $28K · Ghost 31d · Marcus · Okta competing · SSO blocker
- `vanta` — $14.5K · Ghost · Jordan · trial signup needed
- `novapay` — $19K · Attention · Priya · security docs pending
- `stackline` — $31K · Closeable · Marcus · pricing call Mar 24
- `optima` — $55K · Healthy · Jordan · POC review Mar 26

### Tab 2 — Win / Loss
```
[Status strip: amber]
[5-KPI strip: Win Rate (count) · Win Rate (value) · Avg Cycle Won · Avg Cycle Lost · Avg Deal Won]
[g3 grid]
  [Funnel (CSS) — same as overview]
  [Lost reasons chart]
  [Stage timing chart (days per stage)]
[Market signals table — Use Case level aggregation]
  Columns: Use Case | Theme | Improvements | Raw inputs | Deals | MRR at risk | Status
  8 rows (of 12 use cases), sorted by deal count
  Status badges: Shipped ✓ / Q2 in flight / Backlog
[g2 grid]
  [Competitive metrics table: Competitor | Mentions | Win rate w/ | Baseline | Δ | Main theme]
    Okta: 22% win rate (−16pp) · Metabase: 36% (+2pp) · WorkOS: 32% (−2pp) · Auth0: 44% (+10pp)
  [Win rate by segment line chart: SMB/Mid-Market/Enterprise over 6 months]
[Rep scorecards: 4 cards — Sarah 42%↑ · Priya 38%↓1 · Marcus 30%↓5 · Jordan 26%↓7]
```

### Tab 3 — Customers (post-sale health)
```
[Status strip: red — NRR 94% · 3 Critical renewals ≤30d]
[5-KPI strip: NRR · Active MRR · At-Risk MRR · Renewals ≤30d · Time to First CS Touch]
[Account health table: Company | MRR | Plan | Days dark | Renewal | Open tickets | Health | Action]
  15 rows (of 31): 3 Critical (red border) → 4 Watch (amber) → 8 Healthy (green)
  Health logic: Critical = renewal ≤30d AND (dark >60d OR ≥3 tickets)
                Watch = dark 31–60d OR renewal 31–60d OR 1–2 tickets
[g2 grid]
  [MRR waterfall: New + Expansion (positive) vs Contraction + Churn (negative) + net line]
  [NRR trend line + notice: fixing 3 critical accounts recovers ~$5.4K MRR]
```

---

## Sales Stage Model (canonical)

| Stage | Entry | Advance criteria |
|---|---|---|
| Qualifying | Has SQL DB + knows SQL/dbt/LookML | Rep confirms deal worth pursuing |
| Validating | First call completed | Prospect signs up for trial AND connects data source |
| Progressing | Trial + data source connected | Close won or lost (no gate) |
| **Focus ⚡** | Mgmt identifies high-priority | Overlay on Progressing — not a sequential stage |

**Call types (5):** Discovery · Demo · Technical Onboarding · Business User Onboarding · Customer Success Review

**Raw input hierarchy:** Raw Inputs → Improvements → Use Cases → Themes
- Displayed at Use Case level in dashboard (not raw input level) for scalability

---

## What Changed vs v10

| v10 problem | v11 fix |
|---|---|
| Layout too similar to v9, too much whitespace | Z-pattern, compact KPI strips, denser grids |
| Deal cards + table = duplicate components | Removed deal cards, single deals table only |
| Slide-out drawer (JS overlay) | Inline drill-through div below table |
| Accordion for raw inputs (breaks at thousands) | Use Case aggregation table (scales indefinitely) |
| Diverging bar chart + click-to-open competitor view | Plain competitive metrics table, no interaction |
| Account swimlane (max ~9 cards visible) | Full-width sortable table, 15 shown of 31, scales to 200+ |
| KPI cards: 3 KPIs with low density | Compact strip: 6 KPIs per row, 3 data lines each |

---

## Sample Data Summary (v11)

- **Period:** Q1 2026 (Oct 2025–Mar 2026 chart range)
- **Reps:** Sarah Chen · Marcus Webb · Priya Nair · Jordan Lee
- **Pipeline:** 67 open deals · $1.66M · 7 shown in table
- **Customers:** 31 active · $47.8K MRR · 15 shown in table
- **Closed Q1:** 121 entering funnel → 41 won → 80 lost
- **Win rate narrative:** 34% (target 40%) · down 2pp QoQ · missing feature = #1 loss reason at 38%
- **NRR narrative:** 94% · below 100% for 3 months · 3 critical renewals ≤30d

---

## Next Steps (to be confirmed with user)

1. **v12 iteration** — if user has further layout/content feedback on v11
2. **Holistics AML build** — translate prototype into actual dashboard (`.claude/commands/reporting/build-dashboard.md`)
3. **Data model** — build schema + seed data to power the dashboard (`.claude/commands/modeling/build-data-model.md`)
