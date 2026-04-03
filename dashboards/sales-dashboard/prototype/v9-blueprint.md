# v9 Blueprint — Sales Dashboard

Reference file for building v10. Captures all design tokens, layout, components, data, and JS interactions from `prototype-v9.html` (1,250 lines).

---

## Design tokens (CSS vars)

```
--bg: #0d1117          --bg-nav: #0a0e14       --bg-card: #161b27
--bg-card2: #1a2030    --bg-card3: #111620
--border: rgba(255,255,255,.07)   --border2: rgba(255,255,255,.12)
--green: #00c47a   --blue: #3b82f6   --indigo: #6366f1   --purple: #8b5cf6
--amber: #f59e0b   --red: #ef4444    --teal: #06b6d4
--t1: #e2e8f0  --t2: #94a3b8  --t3: #475569   --r: 8px
```

---

## Shell structure

```
<nav class="navbar">          sticky top:0 z:300   — "H Holistics / Sales & Customer Lifecycle"
<div class="filter-bar">      sticky top:52px z:200 — Period | Rep | Segment | Deal type (all <select>)
<div class="tabs-bar">        sticky top:92px z:100 — 4 tabs (JS: switchTab)
<div class="tab-pane#tab-0">  Overview   (active by default)
<div class="tab-pane#tab-1">  Pipeline
<div class="tab-pane#tab-2">  Win / Loss
<div class="tab-pane#tab-3">  Accounts
<div class="overlay#overlay"> + <div class="drawer#drawer">  — deal detail panel (JS)
```

---

## CSS component inventory

| Class | Purpose |
|---|---|
| `.navbar` `.logo` `.logo-mark` `.nav-right` `.nbadge` | Top nav bar |
| `.filter-bar` `.f-label` `.f-select` `.f-sep` `.f-note` | Global filter bar |
| `.tabs-bar` `.tab-btn(.active)` `.tc` `.tc-r` `.tc-a` | Tab switcher |
| `.tab-pane(.active)` | Tab content (display:none → display:block) |
| `.grid` `.g2` `.g3` `.g4` `.g13` `.g12` `.g21` | CSS grid helpers |
| `.card` `.card-sm` `.card-title` | Card container |
| `.sg` `.sg-label` | Section group with top label |
| `.kpi-val(.lg)` `.kpi-sub` `.kpi-delta(.up/.dn/.warn)` `.kpi-target` | KPI metric block |
| `.ss(.green/.amber/.red)` `.ss-dot` | Status strip alert banner |
| `.chart-wrap(.tall/.short) canvas` | Chart.js canvas wrapper |
| `.tbl` `.tbl th/td(.r)(.num)` `.tbl tr(.clickable)` | Data table |
| `.pill(.pill-closeable/.pill-attention/.pill-ghost/.pill-healthy/.pill-critical/.pill-watch/.pill-ok)` | Status pills |
| `.c-red` `.c-amber` `.c-green` `.c-blue` `.c-dim` | Color utility classes |
| `.notice` | Inline insight callout box |
| `.next-step` | Italic blue action text |
| `.deal-scroll` `.dc(.signal-ghost/.signal-attention/.signal-closeable)` | Horizontal deal card row |
| `.dc-header` `.dc-logo` `.dc-name` `.dc-owner` | Deal card header |
| `.dc-stages` `.dc-dot(.done/.current)` `.dc-line(.next)` `.dc-stage-name` `.dc-meta` `.dc-blockers` `.dc-blocker` `.dc-nextstep` | Deal card body |
| `.overlay` `.drawer(.open)` | Slide-in drawer (JS) |
| `.dr-header` `.dr-logo` `.dr-title` `.dr-stage` `.dr-close` | Drawer header |
| `.dr-meta` `.dr-meta-item` `.dr-meta-label` `.dr-meta-val` | Drawer metadata row |
| `.dr-section` `.dr-section-title` `.dr-contacts` `.dr-contact` | Drawer body |
| `.call-toggle` `details>summary` `.ct-chevron` `.ct-left` `.ct-date` `.ct-attendees` `.call-body` `.call-notes` `.call-next` `.call-resolved` | Notion-style call history accordion |
| `.team-accordion` `.team-toggle` `.team-inputs` `.raw-input` `.ri-text` `.ri-meta` `.ri-count` `.ri-mrr` | Win/Loss: missing features accordion |
| `.rep-cards` `.rep-card` `.rep-header` `.rep-avatar` `.rep-name` `.rep-wr` `.rep-bar-wrap` `.rep-bar` `.rep-bar-target` `.rep-stats` `.rep-stat` `.rep-pattern` | Rep scorecard grid |
| `.swimlane` `.lane` `.lane-header(.critical/.watch/.healthy)` `.lane-title` `.lane-count` `.lane-mrr` | Account health swimlane |
| `.ac-card` `.ac-name` `.ac-mrr` `.ac-signals` `.ac-signal .dot` `.ac-action` | Account card (inside lane) |
| `.funnel` `.funnel-stage` `.funnel-label` `.funnel-bar-wrap` `.funnel-bar` `.funnel-conv` | Stage conversion funnel |
| `.fd-row` `.fd-team` `.fd-bar-wrap` `.fd-bar` `.fd-count` `.fd-mrr` `.fd-status(.fd-shipped/.fd-inflight/.fd-backlog)` | Feature demand bar table |
| `.comp-table-wrap(.active)` `.comp-selected-label` | Competitor drill table (JS) |
| `.tab-intro` `.tab-intro-text` | Accounts tab intro card |

---

## Tab 0 — Overview

**Section 1 — Revenue header (grid g13)**
- Card left: KPI — Closed Revenue Q1 2026: **$412K** | vs $384K Q4 | ↑7.3% QoQ | Quota $520K · 79% attainment
- Card right: `#c0_rev` — Line chart, Weekly closed revenue Q1 vs Q4 (WEEKS axis, 11 points each)

**Section 2 — 4 KPI cards (g4)**
- Pipeline Coverage: **3.2×** ($1.66M / $520K) · Above 2.5× threshold
- Win Rate (Value): **35%** · ↓3pp · target 40%
- Win Rate (Count): **34%** · ↓2pp · target 40%
- NRR Trailing 90d: **94%** · ↓2pp — churn pressure

**Section 3 — Funnel health (g2)**
- `#c0_stages` — Bar (horizontal) · Active deals by stage: Qualifying 18, Focus 23, Evaluation 15, Negotiation 11
- `#c0_seg` — Doughnut · Deal composition: SMB 28%, Mid-Market 44%, Enterprise 28%

**Section 4 — Trends (g2)**
- `#c0_wintrend` — Line · Win rate by segment monthly (MONTHS: Oct–Mar): SMB ~44→43, MM ~38→29, Ent ~28→33
- `#c0_nrr` — Line · NRR rolling 90d: [102,101,99,97,95,94] + target 100% dashed

---

## Tab 1 — Pipeline

**Status strip:** amber — "4 deals need action today..."

**3 KPI cards (g3)**
- Closing this week: 2 deals · $98K (HealthTrack + Stackline)
- Needs action today: 4 deals · 2 ghost · 2 product blockers
- Stuck >14 days: 6 deals · $148K · Focus stage

**Deal cards (horizontal scroll)** — 7 cards, click → `openDrawer(id)`:

| id | logo | color | company | owner | value | stage | signal | status |
|---|---|---|---|---|---|---|---|---|
| meridian | MC | #6366f1 | Meridian Co. | Marcus | $28K | Evaluation | ghost | 31d dark |
| vanta | VL | #8b5cf6 | Vanta Labs | Jordan | $14.5K | Focus | ghost | 22d dark |
| databridge | DB | #ef4444 | DataBridge | Sarah | $42K | Focus | attention | SSO/SAML + Audit logs |
| novapay | NP | #f59e0b | NovaPay | Priya | $19K | Evaluation | attention | Security review docs |
| healthtrack | HT | #00c47a | HealthTrack | Sarah | $67K | Negotiation | closeable | Legal approved |
| stackline | SL | #06b6d4 | Stackline | Marcus | $31K | Negotiation | closeable | — |
| optima | OG | #3b82f6 | Optima Group | Jordan | $55K | Evaluation | healthy | On track |

Stage dot counts per deal (done / current / pending):
- meridian: 2 done, 1 current (Evaluation=3rd), 2 pending (5 stages total)
- vanta: 1 done, 1 current (Focus=2nd), 3 pending
- databridge: 1 done, 1 current (Focus=2nd), 3 pending
- novapay: 2 done, 1 current (Evaluation=3rd), 2 pending
- healthtrack: 3 done, 1 current (Negotiation=4th), 1 pending
- stackline: 3 done, 1 current (Negotiation=4th), 1 pending
- optima: 2 done, 1 current (Evaluation=3rd), 2 pending

**Deals table** — same 7 rows, columns: Signal pill | Company | Stage | Value | Days in stage | Last activity | Next step | Owner

---

## Tab 2 — Win / Loss

**Status strip:** amber — "Win rate 34% — 6pp below 40% target..."

**4 KPI cards (g4)**
- Win Rate (Count): 34% · 41/121 closed
- Win Rate (Value $): 35% · $412K/$1.18M
- Avg Deal Size Won: $10.1K vs $7.4K lost
- Avg Cycle (Won): 38d · Focus 18d · ↑4d vs Q4

**Loss reason chart:** `#c2_lost` — Bar horizontal · % of revenue lost: Missing Feature 38%, Competitor Win 26%, Pricing 18%, Ghosted 14%, No Decision 4%

**Missing features deep-dive:** `#c2_features` — Bar horizontal: Performance 10, Reporting 9, Modeling 8, AI 3 (raw inputs)
Accordions (details/summary) per team:
- Performance (10 inputs, 14 customers, $38K MRR): 3 raw inputs
- Reporting (9 inputs, 15 customers, $44K MRR): 4 raw inputs
- Modeling (8 inputs, 15 customers, $40K MRR): 4 raw inputs
- AI (3 inputs, 3 customers, $7K MRR): 2 raw inputs

**Competitor diverging bar:** `#c2_comp` — good [3,4,2,6] / bad [-12,-7,-4,-3] for [Okta, Metabase, WorkOS, Auth0]
- Click bar → `showCompDetail(name)` → populates `#comp-tbl-body` with deal rows
- Comp detail data has 6 deals for Okta, 7 for Metabase, 4 for WorkOS, 6 for Auth0

**Funnel conversion (g2)**
- HTML funnel bars: Qualifying 121 (100%) → Focus 93 (77%) → Evaluation 62 (67%) → Negotiation 46 (74%) → Won 41 (89%)
- `#c2_time` — Bar horizontal · Avg days: Qualifying 5d, Focus 18d, Evaluation 9d, Negotiation 6d

**Rep scorecards (4-column grid):**

| Rep | Avatar color | Win rate | Won | $ Won | Avg deal | Trend |
|---|---|---|---|---|---|---|
| Sarah Chen | #00c47a | 42% ▲ | 14 | $148K | $10.6K | ↑4pp vs Q4 |
| Priya Nair | #3b82f6 | 38% | 11 | $112K | $10.2K | ↓1pp |
| Marcus Webb | #f59e0b | 30% ▲ | 9 | $87K | $9.7K | ↓5pp |
| Jordan Lee | #ef4444 | 26% ▼ | 7 | $65K | $9.3K | ↓7pp |

Target line at 40% for all rep bars.

---

## Tab 3 — Accounts

**Intro card:** "MRR and ARR tell you the total size... NRR tells you if the business is healthy..."

**3 KPI cards (g3)**
- NRR Trailing 90d: 94% · ↓2pp
- At-Risk MRR: $7,500 · 4 accounts
- Renewals ≤30 Days: 3 · $4,200 MRR

**Account health swimlane (3 lanes):**

Critical (3 accounts, $5.4K MRR):
- TrustLayer $2,400/mo — 94d dark, renewal 18d, 2 tickets → "Book call today"
- Greystone Partners $1,800/mo — 71d dark, renewal 26d, 3 tickets → "Resolve 3 tickets"
- Avora Systems $1,200/mo — 62d dark, renewal 29d, 1 ticket → "Re-engage"

Watch (2 accounts, $5.3K MRR):
- Celero Inc. $3,100/mo — 44d dark, renewal 58d, 1 ticket → "Check in"
- Luminate Health $2,200/mo — 37d dark, renewal 32d, 0 tickets → "Renewal call"

Healthy (2 accounts, $6.7K MRR):
- Pathway Co. $4,800/mo — last contact 12d, renewal 91d, 0 tickets → "Expansion opportunity"
- Driftwood Labs $1,900/mo — last contact 8d, renewal 104d, 0 tickets → "No action needed"

Health logic: Critical = renewal ≤30d AND (dark >60d OR ≥3 tickets). Watch = dark 31–60d OR renewal 31–60d OR 1–2 tickets. Healthy = contact <30d AND no imminent renewal AND 0 tickets.

**Revenue health (g2):**
- `#c3_mrr` — Stacked bar + line · MRR movement (MONTHS): New MRR + Expansion above, Contraction + Churn below, Net MRR as white line
  - New MRR: [12,14,11,13,10,9]  Expansion: [4,3,5,4,3,4]
  - Contraction: [-3,-2,-4,-3,-5,-4]  Churn: [-6,-8,-12,-10,-13,-11]
- `#c3_nrr` — Line · NRR [102,101,99,97,95,94] + target 100% dashed, y-axis min:88 max:108

**Feature demand bar-table (5 rows):**
- Performance: 14 cust · $38K · Backlog (red bar 93%)
- Reporting: 15 cust · $44K · Q2 in-flight (amber bar 100%)
- Modeling: 15 cust · $40K · Backlog (indigo bar 100%)
- AI: 3 cust · $7K · Backlog (purple bar 20%)
- SSO/SAML: 6 cust · $18K · Shipped Q1 (green bar 40%)

---

## Chart.js global config

```js
const MONTHS = ['Oct','Nov','Dec','Jan','Feb','Mar'];
const WEEKS  = ['W1 Jan','W2','W3','W4','W1 Feb','W2','W3','W4','W1 Mar','W2','W3'];
const tt  = { backgroundColor:'#1e2a3b', titleColor:'#e2e8f0', bodyColor:'#94a3b8', borderColor:'rgba(255,255,255,.1)', borderWidth:1 };
const gX  = { color:'rgba(255,255,255,.05)' };
const tX  = { color:'#475569', font:{size:11} };
const tY  = { color:'#475569', font:{size:11} };
const leg = { labels:{color:'#94a3b8',font:{size:12},boxWidth:12,padding:14} };
function base(ext={}) { /* responsive, no legend by default, grid from gX/tX/tY */ }
```

Chart IDs: `c0_rev`, `c0_stages`, `c0_seg`, `c0_wintrend`, `c0_nrr`, `c2_lost`, `c2_features`, `c2_comp`, `c2_time`, `c3_mrr`, `c3_nrr`

---

## JS functions

| Function | Trigger | What it does |
|---|---|---|
| `switchTab(n)` | onclick tab buttons | Toggles `.active` on `.tab-pane` and `.tab-btn` |
| `openDrawer(id)` | onclick deal cards / table rows | Looks up `dealData[id]`, injects HTML into `#drawer-content`, adds `.open` to drawer + overlay, locks scroll |
| `closeDrawer()` | onclick overlay / ✕ button / Escape key | Removes `.open`, restores scroll |
| `showCompDetail(name)` | Chart.js onClick on comp bar | Populates `#comp-tbl-body` with deal rows from `compDetails[name]`, shows `#comp-detail`, hides placeholder |
| `clearCompFilter()` | onclick Clear button | Hides `#comp-detail`, shows placeholder |

---

## JS-dependent interactions (won't work in Holistics)

| Interaction | Why it breaks |
|---|---|
| Tab switching | JS toggles display — Holistics dashboards are single-page |
| Deal drawer (openDrawer) | JS injects HTML + slides panel — no DOM manipulation in Holistics |
| Competitor drill table (showCompDetail) | JS populates table on chart click — no click callbacks |
| Escape key / overlay close | Event listeners — not available |
| Chart.js charts | `<canvas>` + external CDN — not available; must use Holistics built-in or Vega-Lite custom charts |

**Holistics-compatible replacements:**
- Tabs → separate dashboard pages or sections
- Deal drawer → drill-through to a "Deal Detail" dashboard
- Competitor drill → cross-filter via Holistics filter interaction
- Charts → Holistics built-in charts or Vega-Lite custom charts

---

## Deal drawer data (7 deals)

All deals have: logo, color, name, stage, value, owner, created, daysOpen, signal, signalColor, contacts[], calls[]

| id | calls count | key blocker / status |
|---|---|---|
| healthtrack | 4 | Legal approved, push for signature Mar 25 |
| databridge | 3 | SSO/SAML hard blocker, Q2 roadmap commitment needed |
| meridian | 3 | 31d dark, Okta competing, effectively lost |
| vanta | 1 | 22d dark, Mar 22 re-engagement call |
| novapay | 2 | Security review docs needed before any progress |
| stackline | 2 | Final pricing call Mar 24, 5% discount for 2yr |
| optima | 1 | POC review Mar 26, aim to sign EOQ1 |
