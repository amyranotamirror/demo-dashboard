# Sales Dashboard — Prototype Version Log

This document explains the design rationale behind each prototype version: what usability problem it was solving, what changed, and why.

---

## The Core Design Challenge

A sales dashboard serves multiple roles at once — reps checking their own pipeline, managers reviewing team performance, product teams mining market signals, CS reps tracking post-sale health. The risk is a dashboard that tries to serve everyone and ends up being useful to no one: too much data, no clear hierarchy, no obvious starting point.

Each prototype iteration tackled a specific layer of this problem.

---

## v1 — Full Coverage Prototype

**File:** [prototype-v1.html](prototype-v1.html)

**What it solved:** Getting everything in one place.

v1 was a complete first pass — all 6 tabs, all the core widget types, all user roles represented. The goal was to validate that the concept document translated into a coherent set of screens.

### What's in v1

| Tab | Primary user | Key widgets |
|---|---|---|
| Overview | Everyone | 4 KPI cards, Needs Attention list, Pipeline snapshot, Customer health donut, Blocking improvements, Shipped → Follow up |
| Pipeline | Sales rep / manager | Deal stage bar chart, Ghost deals alert, Open deals per rep, Calls per rep, Active deals table, Upcoming calls |
| Performance | Sales manager | Win rate KPIs, Stage conversion funnel, Avg time per stage, Lost reason breakdown, Win rate by rep, Ghost rate trend |
| Market Signals | Product team | Top improvements, Won vs. lost by improvement, Blocking improvements table, Competitor mentions, Competitor displacement rate, Trial feedback, Promise tracker |
| Relationship | CS rep | Accounts going dark, Overdue check-ins, My accounts table, Open issues, Deal context panel, Recent signals feed |
| Customer Health | CS manager | MRR trend, At-risk accounts, Subscription changes, Avg tenure by plan, Engagement scatter, Time to first CS touch |

### Usability gaps identified

- **No filters** — every rep sees every deal, every manager sees all reps, no way to scope to "my view" or a specific time period.
- **No contextual guidance** — charts appear without explanation of what a good vs. bad reading looks like.
- **Role mixing** — Overview tries to surface everything for everyone, making it hard for a rep to identify what they need to do today.
- **Flat hierarchy** — all 6 tabs feel equally weighted; there's no signal about where to start.

---

## v2 — Filtered & Structured

**File:** [prototype-v2.html](prototype-v2.html)

**What it solved:** Letting users scope the data to their context, and adding structure to reduce cognitive load.

### What changed from v1

**1. Persistent filter bar (new)**

A sticky filter bar below the navbar lets users control:
- **View toggle:** Team view vs. My Deals — the single most important scope control for a rep
- **Period selector:** Q1 2026, Q4 2025, Last 90 / 30 days, YTD
- **Owner filter:** All reps, or a specific rep name
- **Deal type:** All, New Business, Renewal, Expansion
- **Scope label + Reset button:** Shows active filter state and lets users clear it in one click

Without this, a rep opening the dashboard sees all 115 deals. With it, they see their 12. The view toggle alone changes the dashboard from a manager tool to a rep tool — same underlying data, different context.

**2. Tab badges with counts**

Tabs like "Signals" show a red badge with a count — e.g., the number of active blocking improvements. This gives users a reason to click before they know what's inside.

**3. Reading guides on charts**

Context boxes explain what good looks like: "Target: < 35 days avg cycle for won deals. Anything above 45 days for lost deals represents significant wasted effort." This reduces the time a user spends wondering whether a number is good or bad.

**4. Color-coded notices**

Information blocks use color to signal urgency: red (problem needing immediate action), amber (watch), green (on track), blue (informational). This lets users scan a tab and identify the critical issue without reading every widget.

**5. Tab consolidation: 6 → 5**

"Relationship" and "Customer Health" were merged into a single "Renewals" tab. The original split was conceptually clean (CS reps vs. CS managers) but in practice, both audiences used the same session — the separation added navigation friction without value.

**6. "Market Signals" renamed to "Signals"**

Shorter label, same content. Reduced visual crowding in the tab bar.

### Usability gaps remaining

- **Action orientation still missing** — the dashboard shows data but doesn't prioritize what to do. A rep still has to synthesize "what do I focus on today" themselves.
- **Rep visibility is table-row level** — you can see rep performance in charts, but there's no at-a-glance capacity view (how loaded is each rep right now, who has bandwidth?).
- **No temporal anchoring** — there's no view that says "here's what's happening this week vs. next week."

---

## v3 — Action-Centric

**File:** [prototype-v3.html](prototype-v3.html)

**What it solved:** Making the next action obvious, especially for reps and managers who need to make decisions quickly.

### What changed from v2

**1. Tab renaming: data labels → action labels**

| v2 tab | v3 tab | Why |
|---|---|---|
| Overview | Team & Pipeline | Signals that this is where you check rep capacity and deal health, not just summary numbers |
| Pipeline | Win Deals | The explicit job: close the deals in front of you |
| Renewals | Keep Customers | Same reframe — the job isn't to look at renewals, it's to retain customers |
| Performance | Performance | Unchanged — this is still a manager analysis tab |

The naming shift encodes the user's job-to-be-done rather than the data category.

**2. Rep capacity cards (new in Team & Pipeline)**

Instead of a table row per rep, each rep gets a full card:
- Name, role, status badge
- Open deal count, pipeline value, calls/week
- Stage distribution mini-bar (abbreviated: Q · V · P · F · N)
- Calls progress bar vs. weekly target
- Next scheduled call

This lets a manager answer "who has capacity?" and "who's overloaded?" in a single scan — something that required cross-referencing two charts in v1/v2.

**3. Action cards (new in Win Deals)**

Instead of a deals table, high-priority deals surface as cards with:
- Company name, deal value, owner
- **What:** the current situation (e.g., "Trial ending Friday — customer hasn't given feedback")
- **Next step:** the specific action (e.g., "Schedule debrief call before week end")
- **Left border color:** green (on track), amber (needs attention), red (urgent)

This changes the tab from "here is your pipeline data" to "here is what you need to do today."

**4. Blocker cards (new in Win Deals)**

Product gaps that are blocking multiple deals surface as cards grouped by improvement, with the list of affected deals shown inline. This makes the sales-to-product escalation path visible without navigating to a separate signals tab.

**5. Activity timeline (new in Team & Pipeline)**

A day-grouped list of past and upcoming calls — "Monday Mar 17", "This Week", "Next Week" — gives managers a temporal anchor for team activity. It shows who is calling whom, and when, without requiring a calendar.

**6. Issue cards (new in Keep Customers)**

Post-sale issues (bugs, concerns, questions) appear as left-bordered cards with priority, age, and the verbatim issue text in italics. This gives CS reps the specific context they need before a call rather than requiring them to click into a detail view.

**7. Tab reduction: 5 → 4**

The "Signals" tab content was distributed:
- Blocking improvements → Win Deals (as blocker cards, next to the deals they affect)
- Promise tracker → Keep Customers (next to the renewal and issue context)
- Competitor analysis → Performance (as part of the "why we win/lose" story)

Merging signals into the workflow tabs means a rep sees blockers in context of the deal, not as an abstracted list to mentally map back to their work.

### Usability gains

| Problem from v1/v2 | v3 solution |
|---|---|
| Rep has to decide what to do | Action cards tell them |
| Manager has to cross-reference charts for rep capacity | Rep cards show it in one glance |
| Signals tab is disconnected from deal context | Blockers appear next to the deals they affect |
| No temporal view of team activity | Activity timeline with day anchors |
| Tab names describe data, not jobs | Tab names describe the user's goal |

---

## v4 — Today-First

**File:** [prototype-v4.html](prototype-v4.html)

**What it solved:** Making the day-start ritual explicit. v3 proved action cards work, but the entry point was still a generic "Team & Pipeline" tab. v4 replaced it with a dedicated "Today" tab that opens with a Morning Brief and routes users to either My View (rep) or Team View (manager) from a single screen.

### What changed from v3

**1. Morning Brief card (new in Today tab)**

A numbered briefing card at the top of every session — personalized by role. Each item names the company or person, states the situation, and links to the relevant tab:

> *"1. HealthTrack evaluation at 10 am — contract in review, push for signature. (Win Deals →)"*
> *"2. DataBridge Co stuck 22 days in Focus — negotiation call tomorrow, two blockers: SSO/SAML and Excel Export. (View deal →)"*
> *"3. CloudMosaic ghost for 46 days — $9,600 at risk. Call today before you lose it. (Rescue needed →)"*

The Team View version switches to manager-relevant items (which rep needs coaching, which customer is about to churn, which product issue is near threshold).

**2. My View content (new in Today tab)**

Below the Morning Brief, My View shows:
- Call schedule for today and this week with deal stage and a one-line prep note
- My Pipeline snapshot: open deal count per stage + ghost count highlighted in red
- My Calls This Week: progress bar vs. weekly target + personal win rate KPI

**3. Tab names finalized**

| v3 tab | v4 tab | Why |
|---|---|---|
| Team & Pipeline | Today | Signals "open this first" — not just a data view |
| Win Deals | Win Deals | Unchanged |
| Keep Customers | Keep Customers | Unchanged |
| Performance | Performance | Unchanged |

### Usability gains

- A rep opening the dashboard sees exactly what to do today — not pipeline data to synthesize
- A manager switching to Team View sees rep capacity in context of the Morning Brief
- Named entities and specific dates ("HealthTrack evaluation at 10 am") make the briefing actionable rather than generic

### Usability gaps remaining

- **Morning Brief is hard to implement in production** — requires a rule engine, priority ranking, and role-aware personalization. In the prototype it's hardcoded.
- **"Today" tab confused exec users** who wanted a persistent summary view, not a day-start ritual tied to a specific date
- **Cross-tab evidence chains were still implicit** — you could see win rate was down in Performance, but connecting it to a specific product gap required manual navigation

---

## v5 — Status Strips and Neutral Tab Names

**File:** [prototype-v5.html](prototype-v5.html)

**What it solved:** Two problems from v4 — Morning Brief implementation complexity, and "Today" as an entry point not working for exec and manager users who need a persistent summary rather than a date-anchored briefing.

### What changed from v4

**1. Tab names: job labels → neutral/informative**

| v4 tab | v5 tab | Why |
|---|---|---|
| Today | Overview | Persistent summary for all roles, not a day-start ritual |
| Win Deals | Pipeline | "Win Deals" was motivating for reps but confused managers who needed a deal list |
| Keep Customers | Customers | Same simplification — the data label works for all audiences |
| Performance | Win/Loss | Directly states what the tab analyzes — outcome-oriented |

**2. Status strips replace Morning Brief as primary orientation mechanism**

A one-to-two sentence summary pinned to the top of each tab with color coding (green / amber / red). States the current situation before any chart is read:

> *"Win rate 34% — 6pp below the 40% target, improving +3pp vs Q4. The main risk: 'Missing Feature' in 38% of losses and ghost rate climbing to 14%."*

The status strip achieves most of the Morning Brief's value — orient the user immediately — at a fraction of the implementation cost. No rule engine required; updated by the dashboard author as data changes or implemented as a computed annotation in production.

**3. Signal bar in Pipeline tab (new)**

Four count chips at the top of the Pipeline tab — ghost deals, stuck deals, closeable deals, at-risk pipeline $ — that give users an urgency summary before they look at any individual deal row.

**4. Deals table sorted by signal urgency (new)**

Pipeline deals table defaults to: closeable → stuck → ghost → healthy. The highest-priority deals appear first without the user having to sort or filter.

**5. Cross-tab navigation bar in Overview (new)**

Explicit "Drill into →" chips at the bottom of Overview link to each specialist tab with the current alert count. Makes the diagnostic chain visible without requiring users to know the tab order.

**6. My/Team view toggle moved into Pipeline tab**

Removed from the top filter bar (where it applied globally) and embedded within the Pipeline tab. Reduces cognitive load for exec and product users who never use the rep/team split.

### Usability gains

| Problem from v4 | v5 solution |
|---|---|
| Morning Brief too complex to implement | Status strip delivers 80% of the value |
| "Today" tab confuses exec / manager users | "Overview" serves all audiences as a shared entry point |
| Cross-tab navigation was implicit | Nav bar at bottom of Overview makes diagnostic chain explicit |
| Deals table unsorted — rep has to find urgent items | Table sorted by signal urgency by default |
| My/Team toggle cluttered the global filter bar | Toggle moved inside Pipeline tab where it's relevant |

---

## Version Summary

| | v1 | v2 | v3 | v4 | v5 |
|---|---|---|---|---|---|
| **Tabs** | 6 | 5 | 4 | 4 | 4 |
| **Tab names** | Data labels | Data labels | Job labels | Job labels (Today-first) | Neutral / informative |
| **Entry point** | Overview | Overview | Team & Pipeline | Today (Morning Brief) | Overview (status strip) |
| **Global filters** | None | Filter bar: toggle + period + owner + type | Same | Same | Toggle moved into Pipeline tab |
| **Data orientation** | Show everything | Show filtered data | Show what to do | Show what to do today | Show where things stand |
| **Orientation mechanism** | None | Color notices | Section headers | Morning Brief (rule-driven prose) | Status strip (1-sentence per tab) |
| **Rep view** | Table rows | Table rows | Capacity cards | Capacity cards + call schedule | Capacity cards in Pipeline |
| **Action priority** | Implicit | Semi-explicit (notices, badges) | Explicit (action cards) | Very explicit (Morning Brief + links) | Implicit urgency (signal bar + sorted table) |
| **Temporal view** | None | None | Activity timeline | Call schedule + activity timeline | None (removed) |
| **Signals** | Dedicated tab (full) | Dedicated tab (condensed) | Embedded in workflow tabs | Embedded in workflow tabs | Embedded in Pipeline (blocker cards) |
| **Customer health** | 2 separate tabs | 1 combined tab | 1 action-oriented tab | 1 action-oriented tab | 1 consolidated tab (Customers) |
| **Cross-tab navigation** | None | None | None | Brief items link to tabs | Explicit nav bar + inline xlinks |

The progression is: **coverage → filtering → action → today-first → situational awareness**. v1 proves the concept. v2 makes it navigable. v3 makes it actionable. v4 makes the day-start ritual explicit. v5 makes it durable across all roles and lower-cost to implement.

---

## v12 — Abstraction Layers + Chart Diversity

**File:** [prototype-v12.html](prototype-v12.html)

**What it solves:** v11 had 4 tabs that mixed abstraction levels within tabs (executive KPIs alongside deal-level tables). v12 enforces a strict general→detailed hierarchy: each tab operates at one abstraction level. It also expands from 4 to 5 tabs, adds a dedicated Calls & Market Intel tab for the dual-purpose need (sales call management + product market intelligence), and integrates 20+ Holistics chart types to maximize the platform's visualization capabilities.

### What changed from v11

**1. Tab structure: 4 → 5 tabs with strict abstraction hierarchy**

| Tab | v11 | v12 | Abstraction level |
|---|---|---|---|
| 0 | Overview (KPIs + funnel + rep table) | Overview (executive pulse only — no individual deals or reps) | Highest |
| 1 | Pipeline (signal bar + deals table + drill-through) | Pipeline (deal-level grouped by status: New → Progressing → Results) | Operational |
| 2 | Win/Loss (analysis + market signals + rep scorecards) | Performance (win/loss + deal velocity + rep analysis + competitive landscape) | Analytical |
| 3 | Customers (post-sale health) | Calls & Market Intel (call management + feature tracker + competitive intel) | Operational + Strategic |
| 4 | — | Customers (customer base overview + engagement + triage + revenue health) | Mixed (exec → CS) |

**2. Overview tab redesigned for executives**

Removed the rep performance table (moved to Performance tab) and individual deal references. Added:
- **Sales stages funnel** (Holistics Conversion Funnel) with country breakdown and deal value annotation at stages where pricing discussion has occurred
- **Deal value trend vs target** (Combination Chart) showing monthly deal value vs. quota pace — not cumulative
- **Customer geography** (Geo Map Choropleth) showing customer + MRR concentration by country
- **Cross-tab navigation bar** (Dynamic Content Block) with actionable counts per tab

**3. Pipeline tab restructured around deal lifecycle**

Instead of a flat deals table sorted by urgency, deals are grouped into three workflow sections:
- **New deals** — just entered pipeline (count, value, source, country)
- **Progressing deals** — requires active attention, with sub-statuses: Promising, Focus, At Risk, Highlight (existing customer or prospect that promised to return)
- **Results** — recently won or lost (with lost reason visible)

Added scope rule: only shows customer (upsell/downgrade in discussion), prospect (active), prospect (focus). Won→active-customer and lost→inactive-prospect deals exit this view.

**4. New Performance tab (expanded from Win/Loss)**

Merged win/loss analysis with rep performance into one analytical tab. Added:
- **Gauge Charts** for Win Rate % and Ghost Rate % vs. targets
- **Win reason analysis** (Donut Chart) alongside lost reasons
- **Win vs Lost factor comparison** (Pivot Table) — side-by-side pattern analysis
- **Deal cycle histogram** (Custom Vega-Lite) — bimodal distribution showing clean cycles vs. re-engaged deals
- **Rep capacity scatter** (Scatter/Bubble Chart) — open deals vs. win rate, bubble size = pipeline value
- **Deal value per quarter by segment** (Combination Chart with stacked bars + target line)

**5. New Calls & Market Intel tab (dual-purpose)**

Top half for sales (call management):
- **Call calendar heatmap** (Dynamic Content Block) — visual monthly calendar showing call density
- **Upcoming calls checklist** (Data Table) — next 14 days with prep notes
- **Recent call insights** (Data Table with expandable rows) — AI summaries from call platform

Bottom half for product (market intelligence):
- **Feature request kanban** (Dynamic Content Block) — Backlog → In Review → In Flight → Shipped
- **Feature requests bubble chart** (Bubble Chart) — companies vs. deal value at risk vs. raw input count
- **Competitor mention trend** (Stacked Column Chart) — monthly competitor visibility
- **Competitor deep analysis** (Pivot Table) — praise/complaints/learnings/failures per competitor
- **Lost-to-competitor analysis** (Horizontal Bar Chart) — deals lost per competitor with win rate delta

**6. Customers tab expanded with engagement metrics**

Added to the existing health monitoring:
- **Customer geography** (Geo Map Choropleth) — country breakdown with plan tier
- **Plan distribution** (Donut Chart) and **plan change tracking** (Stacked Column Chart)
- **Satisfaction score trend** (Line Chart) — CSAT over time with target
- **Ticket metrics** (Metric Sheets style) — opened, resolved, resolution time, CSAT per month
- **Engagement by channel** (Donut Chart) — Slack, tickets, community, calls distribution
- **Channel column** added to triage table
- **Version adoption** note in action cells — proactive upgrade suggestions

**7. Holistics chart types integrated (20+ types)**

Each widget is tagged with its Holistics chart type in a purple badge. Types used:
- KPI Metric (headline numbers throughout)
- Conversion Funnel (sales stages with country breakdown)
- Data Table (deal lists, rep tables, customer triage, call lists)
- Pivot Table (win/loss comparison, competitor deep analysis)
- Bar Chart horizontal (lost reasons, stage timing, competitor losses)
- Column Chart grouped (stage movement, plan changes)
- Column Chart stacked (competitor mentions, value by segment)
- Line Chart (win rate, NRR, satisfaction, win rate by segment)
- Area Chart stacked (MRR components)
- Combination Chart (deal value vs target with column + line)
- Donut Chart (win reasons, plan distribution, engagement channels)
- Gauge Chart (win rate, ghost rate — CSS-only representation)
- Geo Map Choropleth (customer geography — placeholder with data)
- Scatter/Bubble Chart (rep capacity, feature request impact)
- Histogram (deal cycle distribution — custom Vega-Lite)
- Waterfall (deal value by stage — custom Vega-Lite)
- Dynamic Content Block (status strips, calendar heatmap, kanban board, nav chips)
- Metric Sheets (ticket metrics with period comparison)

### Design principles applied

| Principle | How v12 implements it |
|---|---|
| **General → detailed** | Overview = big picture (no individual deals). Pipeline = deal-level. Performance = analytical aggregates. Each tab has one abstraction level |
| **Don't mix abstraction levels** | Rep performance table removed from Overview (was in v11). Rep scatter + scorecard consolidated in Performance tab only |
| **Dual-purpose tabs** | Calls & Market Intel serves both sales (call management) and product (market intel) from the same data source |
| **Chart diversity** | 20+ Holistics chart types used — each chosen for the specific data shape, not just variety |
| **Insight-first titles** | Every chart has a title that states the finding, not just the measure |

## v6 — Triage-First (proposed)

**File:** prototype-v6.html *(to be built)*

**What it solves:** v5 achieved situational awareness but didn't complete the job. The problems surfaced in review:

1. **Overview** — Active pipeline by stage is static (no sense of movement or week-over-week change). Lost reason chart surfaces the problem but doesn't tell the team what to do about it.
2. **Pipeline** — No z-pattern or visual hierarchy. Raw deals table pushed to the top, rep capacity cards buried below. Scattered concerns (rep pacing + product blockers + deal data all on one screen).
3. **Win/Loss** — Avg cycle KPIs are not actionable without context. Win rate by deal count alone is insufficient — winning 3 big deals beats winning 10 small deals at the same %. Stage conversion and ghost rate trend duplicated or misplaced from Overview.
4. **Customers** — Post-sale state is split across 4–5 separate widgets (dark accounts, overdue check-ins, open issues, at-risk accounts) all showing the same accounts from different angles. Users have to mentally join them.

**Design principle for v6:** Every widget passes the "so what?" test. If a user reads it and can't immediately know what to do differently, it doesn't belong. Where v5 achieved *situational awareness*, v6 achieves *triage* — the user sees the situation and the priority order simultaneously.

---

### Tab 0: Overview — "Are we on track this period?"

**Primary user:** Exec · Sales manager (30-second pulse)
**Visual hierarchy:** Status strip → 3 KPIs → Period comparison → Action items + Lost reasons

#### Section 1 — Status strip
*Holistics widget: Dynamic Content Block*

One sentence + color, same pattern as v5.

#### Section 2 — 3 KPI cards
*Holistics widget: KPI Metric (×3)*

| KPI | What it shows | Why this over v5 |
|---|---|---|
| Pipeline coverage | Active pipeline $ / quarterly quota (e.g., 3.2×) | "Active pipeline $" is raw data. Coverage ratio tells you immediately if there's enough — below 2.5× is a fill problem, not a conversion problem. |
| Win rate (value-weighted) | $ won / $ total closed | Count-based win rate ignores deal size. Winning 3 enterprise deals at 30% is better than 8 SMB deals at 50%. Show both: count % and value %. |
| NRR trailing 90d | Net Revenue Retention vs. 100% target | Same as v5. Post-sale health in one number. |

**Removed:** Ghost rate from Overview (operational metric — belongs in Pipeline tab). Total MRR (trailing indicator — NRR is more useful here).

#### Section 3 — Period comparison by stage
*Holistics widget: Column Chart (grouped — this period vs last period, x-axis = deal stage)*

Replaces the static "Active pipeline by stage" horizontal bar from v5. Showing the same funnel two periods side by side answers "did stage X grow or shrink?" — the question the static chart can't answer. E.g., "Qualifying: 32 → 28 (progressed), Focus: 19 → 23 (deals accumulated)" immediately shows where deals are moving and where they're stalling.

#### Section 4 — Two-column: Action items + Lost reasons
*Left — Action items: Dynamic Content Block*
*Right — Lost reasons: Bar Chart (horizontal, sorted by % of closed-lost)*

**Left — Top 3 action items:**
Three named, specific items with owner and urgency. Replaces the generic "Needs Attention" alert list. Not a summary of charts — a pre-synthesized action list:
- "DataBridge stuck 22d in Focus · Sarah · SSO/SAML blocked → [Pipeline →]"
- "TrustLayer renewal in 18d · dark 94d · Lisa → [Customers →]"
- "Missing Feature at 38% — 2pp from threshold → [Win/Loss →]"

**Right — Lost reasons:**
Same horizontal bar as v5 but each bar annotated with the team's lever:
- *Missing Feature*: "4 active deals blocked · $71K · [See blockers in Pipeline →]"
- *Competitor win*: "Okta/Metabase in 18 deals · [See displacement in Win/Loss →]"
- *Ghosted*: "14% ghost rate, above 10% threshold · [See pipeline health →]"

The annotation + cross-tab link converts a data chart into an action chart.

---

### Tab 1: Pipeline — "Which deals need action right now?"

**Primary user:** Sales rep (My Deals) · Sales manager (Team Health)
**Visual hierarchy:** Signal summary → Deals table → [Manager: rep health table + pipeline movement]

The v5 problem: rep capacity cards, blocker cards, and deals table were all presented at the same visual weight with no clear reading order. v6 separates the rep and manager experiences cleanly and removes blocker cards from this tab (they belong in Win/Loss where the root cause story is explained).

#### My Deals view (default for reps)

**Today's focus — compact summary card** *(Dynamic Content Block, full width, small)*
Not a detailed briefing — just the 2–3 things that change what you do today:
- "Evaluation call at 10am — HealthTrack — push for signature"
- "1 deal stuck 22 days — DataBridge — resolve blockers on tomorrow's call"
- "2 ghost deals — $14K — close or re-engage this week"

**Deals table** *(Data Table, full width — PRIMARY content)*

| Column | Type | Notes |
|---|---|---|
| Signal | Pill | 🟢 Closeable / 🟡 Attention / 🔴 Ghost / ⚪ Healthy |
| Company | Text | — |
| Stage | Text | — |
| Value | Number | — |
| Days in stage | Number | Conditional red if > threshold |
| Last activity | Date | — |
| Next step | Text | One-line action: "Push for signature", "Resolve SSO", "Re-engage or close" |
| Owner | Text | — |

Sorted by signal: closeable → attention → ghost → healthy. The "Next step" column is the key addition over v5 — the table is no longer a data dump, it's an action queue.

#### Team Health view (manager)

**Rep health table** *(Data Table, full width — PRIMARY content)*

| Column | Type | Notes |
|---|---|---|
| Rep | Text | — |
| Open deals | Number | — |
| Pipeline $ | Number | — |
| Win rate % | Number | Conditional green if ≥ target |
| $ Win rate | Number | $ won / $ closed — value efficiency |
| Calls/wk | Number | Conditional red if < target |
| Ghost deals | Number | Conditional red if > 1 |
| Status | Pill | On track / Needs attention / At risk |

Replaces rep capacity cards with a format Holistics natively supports well. Same information — more scannable. Data Table with conditional formatting is the right tool here, not custom HTML cards.

**Pipeline movement — period comparison** *(Column Chart, grouped — this week vs last week, by stage)*
Shows what changed, not just what is. Placed below the rep table — it's context for the manager, not a primary action driver.

**Removed from Pipeline:** Blocker cards (moved to Win/Loss where root cause story belongs), activity timeline (not actionable enough to justify the screen space).

---

### Tab 2: Win/Loss — "Why are we winning and losing, and what changes?"

**Primary user:** Sales manager · BizOps · Product team
**Visual hierarchy:** Status strip → Root cause (lost reasons) → Evidence (funnel + time) → Rep analysis → Competitor table

The v5 problem: led with KPI cards (avg cycle, win rate) that weren't actionable, buried the root cause analysis, and duplicated charts from Overview.

#### Section 1 — Status strip + 2 KPIs
*Holistics widget: Dynamic Content Block + KPI Metric (×2)*

Only 2 KPIs here — already shown on Overview:
- Win rate (count): 34% vs 40% target
- Win rate (value): $310K won of $890K closed = 35%

Avg sales cycle removed as a standalone KPI. Instead, cycle time appears as an annotation on the stage chart: "Avg 28 days in Focus — longest stage, main drag on cycle."

#### Section 2 — Lost reason breakdown (PRIMARY story)
*Holistics widget: Bar Chart (horizontal, sorted by % of closed-lost revenue)*

Ranked by revenue impact ($ lost), not deal count. Each bar annotated with the team's lever:
- Missing Feature → link to Pipeline blocker cards
- Competitor win → link to competitor table below
- Pricing → annotation: "Concentrated in Mid-Market vs Enterprise — pricing tier issue"
- Ghosted → link to Pipeline ghost management

This is the "so what?" fix for Win/Loss. The chart doesn't just show the problem — it points to the response.

#### Section 3 — Stage conversion + time-in-stage
*Holistics widget: Conversion Funnel (native) + Bar Chart horizontal (avg days per stage)*

Two widgets side by side. The Conversion Funnel shows the drop-off percentage at each stage. The horizontal bar beside it shows avg days per stage for won deals. The key annotation: "Deals taking >14 days in Focus at this stage close at half the rate — earlier blocker resolution or qualifying out is the lever."

Together they answer: *where* are deals dying and *why* (time stall vs. hard drop-off).

#### Section 4 — Rep performance
*Holistics widget: Data Table*

| Column | Notes |
|---|---|
| Rep | — |
| Won deals | Count |
| $ Won | Value |
| Avg deal size won | $ won / won deals — shows if winning high-value or low-value |
| Win rate % | Count-based |
| Win rate $ | Value-based |
| Top loss reason | Text — most frequent lost_reason for this rep's deals |

Adding avg deal size and value-weighted win rate surfaces the "winning big vs many small" distinction the count metric hides.

#### Section 5 — Competitor displacement
*Holistics widget: Data Table*

| Column | Notes |
|---|---|
| Competitor | — |
| Deals mentioned | Count |
| Win rate (with competitor) | % |
| Baseline win rate | % |
| Delta | pp — negative = this competitor hurts |
| $ at risk (active deals) | $ value of open deals where competitor is present |

Sorted by $ at risk, not deal count. A competitor in 5 enterprise deals is more urgent than one in 20 SMB deals.

**Removed from Win/Loss:** Ghost rate trend (belongs in Pipeline), monthly win/loss trend (moved to Overview period comparison).

---

### Tab 3: Customers — "Which accounts need action and why?"

**Primary user:** CS rep (daily triage) · CS manager (weekly revenue health)
**Visual hierarchy:** Status strip → KPIs → Customer triage table → Promise tracker → [Manager: MRR / NRR charts]

The v5 problem: post-sale state was split across 4–5 separate widgets (dark accounts, overdue check-ins, open issues, at-risk accounts) all showing the same accounts from different angles. A CS rep had to mentally join them. v6 consolidates into one well-designed triage table.

#### Section 1 — Status strip + 3 KPIs
*Holistics widget: Dynamic Content Block + KPI Metric (×3)*

- NRR trailing 90d: 94% vs 100% target
- At-risk MRR: $7,500 (4 accounts)
- Renewals in ≤30 days: count + total MRR

#### Section 2 — Customer triage table (PRIMARY content)
*Holistics widget: Data Table (conditional row formatting)*

This single table replaces: accounts going dark list + overdue check-ins list + open issues table + at-risk accounts alert table. They were 4 widgets showing the same accounts from different angles. One well-designed table beats 4 narrow lists.

| Column | Notes |
|---|---|
| Account | Text |
| MRR | $ |
| Plan | Tier |
| Days since contact | Number — red if > 60, amber if 31–60 |
| Renewal in | Days — red if ≤ 30 |
| Open issues | Count — red if ≥ 3 |
| Health | Pill: Critical / Watch / Healthy — computed from the three signals |
| Recommended action | Text: "Book call today", "Resolve ticket #12", "Upsell opportunity — new plan launched" |

**Row sorting:** Critical → Watch → Healthy. Within each tier, sorted by MRR (highest revenue at risk first).

**Health score logic** (documented, not just boolean):
- Critical: renewal ≤30d AND (dark >60d OR ≥3 open issues)
- Watch: dark 31–60d OR renewal 31–60d OR 1–2 open issues
- Healthy: contact <30d AND no imminent renewal AND ≤0 open issues

This replaces the boolean composite flag critique from the concept doc. Individual signals visible in columns; health tier is the computed summary.

#### Section 3 — Promise tracker
*Holistics widget: Data Table*

| Column | Notes |
|---|---|
| Feature shipped | Text |
| Customers to notify | Count |
| Notified | Y/N or % |
| Rep owner | Text |
| Days since ship | Number — red if > 14 |

CS rep's action list for product follow-through. Compact, placed after the main triage table.

#### Section 4 — Revenue health (manager view)
*Holistics widget: Area Chart (stacked) + Line Chart*

- Area Chart: MRR components — new MRR + expansion (positive stack) vs contraction + churn (negative stack or below-axis). Shows revenue momentum at a glance.
- Line Chart: NRR trend (trailing 90d rolling) with a 100% target reference line.

Both charts are for the CS manager's weekly review — below the operational content the rep uses daily.

**Removed:** Avg tenure by plan tier (not actionable for either CS rep or manager), time to first CS touch as a standalone KPI (surfaced as a note in the triage table "5 accounts > 7 days to first touch" if relevant), deal context panel (available as a drill-through from the triage table row, not a persistent widget).

---

### Why this structure works

| v5 problem | v6 fix |
|---|---|
| Active pipeline chart can't show movement | Period comparison (grouped column chart) shows this period vs last period side by side |
| Lost reasons chart doesn't say what to do | Each bar annotated with the lever + cross-tab link |
| Pipeline tab mixed concerns (rep + features + deals) | My Deals and Team Health cleanly separated; blocker cards moved to Win/Loss |
| Avg cycle KPIs not actionable | Removed as standalone KPI; shown as annotation on stage conversion chart |
| Win rate by count ignores deal value | Added value-weighted win rate alongside count rate |
| Win/Loss stage conversion duplicates Overview | Overview uses period comparison (movement); Win/Loss uses Conversion Funnel (drop-off %) — different questions |
| Customers split across 4 widgets | One triage table with conditional formatting replaces all four |
| At-risk flag is boolean | Triage table shows individual signals + computed health tier — not binary |

---

## v7 — Story-First, Filter for Context (proposed)

**File:** prototype-v7.html *(to be built)*

**What it solves:** v6 still had personal-view thinking baked into the structure (My/Team toggle in Pipeline). Removing that entirely changes the logic: tabs are no longer about who you are, they're about what you're looking at. A rep, a manager, and an exec all open the same tab — the rep just applies a filter.

More importantly, v6 tabs felt like a list of widgets at equal weight. v7 fixes this by giving each tab a clear narrative arc — a reading order where each section answers the natural "and then what?" question that the previous section raises.

**Design principle for v7:** Each tab tells a complete story. You read it top to bottom like a paragraph, not scan a grid. Tab names are the nouns your team actually uses. Personal context (rep, period, segment) is always a filter, never a structural tab.

**Tab structure:** Overview · Pipeline · Win/Loss · Accounts (4 tabs)

### Global filter bar (always visible)

| Filter | Type | Notes |
|---|---|---|
| Period | Date range | Quarter / month / custom |
| Rep | Multi-select | All by default — rep narrows to themselves |
| Segment | Select | SMB / Mid-Market / Enterprise |
| Deal type | Select | New / Renewal / Expansion |

No My/Team toggle. Rep filter is the same mechanism for both — a rep selects themselves, a manager clears it.

### Global filter bar (always visible)

| Filter | Type | Notes |
|---|---|---|
| Period | Date range | Quarter / month / custom |
| Rep / Team | Multi-select | "All" by default — rep filters their own view |
| Segment | Select | SMB / Mid-Market / Enterprise |
| Deal type | Select | New / Renewal / Expansion |

The My/Team toggle from v5–v6 is replaced by the Rep filter. No structural difference between a rep filtering to themselves vs a manager looking at the full team.

---

---

### Tab 0: Overview — The full business health check

**Primary users:** Exec · Sales manager (weekly read, 2 minutes)
**Narrative arc:** How much did we close → what's in the funnel → are we converting → are customers staying → what needs attention now

This tab is not a summary of the other tabs. It has its own unique views — trend lines and composition charts that don't exist elsewhere. An exec should be able to read this tab alone and understand the state of the business.

#### Section 1 — Closed revenue vs last period
*Line Chart — this period vs last period, x-axis = week*

The first thing anyone wants to know: are we ahead or behind? Two lines (this quarter, last quarter) so the trend is immediately visible. No need to switch tabs to see it.

#### Section 2 — 4 KPI cards
*KPI Metric × 4*

| KPI | Notes |
|---|---|
| Total closed revenue | This period, vs last period % change |
| Pipeline coverage | Active pipeline $ / quota — below 2.5× is a fill problem |
| Win rate (value) | $ won / $ closed — value-weighted, more honest than count |
| NRR trailing 90d | Post-sale health in one number, vs 100% target |

Four numbers. If all four are green, the business is healthy. If one is red, you know where to go next.

#### Section 3 — Pipeline by stage + deal composition
*Column Chart (stage distribution) + Donut Chart (by segment) — side by side*

Left: deals in each stage right now — is the funnel full and balanced, or is everything stuck in one stage?
Right: deal composition by segment (SMB / Mid-Market / Enterprise) — are we fishing in the right pond?

#### Section 4 — Win rate trend by segment
*Line Chart — monthly win rate, one line per segment*

Not just the current number — the direction. Is Mid-Market win rate recovering or sliding? Which segment is pulling the average down? Tooltip highlights the segment with the biggest month-over-month move.

#### Section 5 — Retention signal
*Line Chart — NRR rolling 90d, with 100% reference line*

A single line. If it's below 100% and declining, that's a churn story that needs the Accounts tab. If it's holding above 100%, expansion is working.

#### Section 6 — Top 3 action items
*Dynamic Content Block*

Pre-synthesized, not a widget summary. Three named, specific items with owner and a tab link:
- "DataBridge stuck 22d in Focus · SSO blocker unresolved · [Pipeline →]"
- "TrustLayer renewal in 18d · dark 94d · Lisa → [Accounts →]"
- "Missing Feature at 38% loss — 2pp from 40% threshold · [Win/Loss →]"

---

### Tab 1: Pipeline — What deals are in play?

**Primary users:** Sales manager · Rep (filtered) · BizOps
**Narrative arc:** How healthy is the funnel → where are deals moving → which ones need action

#### Section 1 — 3 KPI cards
*KPI Metric × 3*

| KPI | Notes |
|---|---|
| Active pipeline $ | Total open deal value |
| Pipeline coverage | Active $ / quarterly quota |
| Ghost rate | % of open deals with no activity >14d — red if >10% |

#### Section 2 — Stage movement
*Column Chart — grouped, this period vs last period, x-axis = stage*

Where did deals come from and where are they going? Two bars per stage shows growth (Qualifying up), stall (Focus flat), or drain (Evaluation shrinking). The question "is the funnel moving?" answered visually.

#### Section 3 — Deals table (PRIMARY content)
*Data Table — full width*

| Column | Notes |
|---|---|
| Signal | Pill: Closeable / Attention / Ghost / Healthy |
| Company | — |
| Stage | — |
| Value | $ |
| Days in stage | Red if > threshold by stage |
| Last activity | — |
| Next step | "Push for signature", "Resolve SSO blocker", "Re-engage or close" |
| Owner | Rep name — sortable |

Default sort: Ghost → Attention → Closeable → Healthy. With rep filter, a rep sees their own deals. Without, manager sees the full team. Same table, same columns — filter changes the scope, not the view.

---

### Tab 2: Win/Loss — Why are we winning and losing?

**Primary users:** Sales manager · BizOps · Product team
**Narrative arc:** What's our win rate → what's costing us the most → where in the funnel do deals die → who's winning and who isn't → which competitors are the biggest threat

#### Section 1 — 2 KPI cards
*KPI Metric × 2*

| KPI | Notes |
|---|---|
| Win rate (count) | % of closed deals won vs target |
| Win rate (value) | $ won / $ closed — shows if we're winning the right deals |

#### Section 2 — Lost reason breakdown (PRIMARY story)
*Bar Chart — horizontal, sorted by $ revenue lost*

Ranked by revenue impact, not deal count. Winning against pricing on 10 SMB deals matters less than losing one enterprise deal to a missing feature. Each bar has a one-line annotation:
- Missing Feature → "4 active deals at risk · $71K · [see Pipeline →]"
- Competitor win → "Okta/Metabase in 18 open deals · [see table below →]"
- Pricing → "Concentrated in Mid-Market — tier gap, not discount issue"
- Ghosted → "14% ghost rate, above 10% threshold · [see Pipeline →]"

#### Section 3 — Stage conversion + time-in-stage
*Conversion Funnel + Horizontal Bar Chart — side by side*

Left: conversion % at each stage — where do deals drop off hardest?
Right: avg days per stage for won deals — where is time being lost?
Together: "Focus stage drops 34% of deals AND takes 18 days avg — that's the main drag on cycle time."

#### Section 4 — Rep performance table
*Data Table*

| Column | Notes |
|---|---|
| Rep | — |
| Won deals | Count |
| $ Won | Value |
| Avg deal size won | Are they winning big or many small? |
| Win rate % | Count-based |
| Win rate $ | Value-based |
| Top loss reason | Most frequent lost_reason for this rep's deals |

#### Section 5 — Competitor displacement table
*Data Table — sorted by $ at risk*

| Column | Notes |
|---|---|
| Competitor | — |
| Deals mentioned | Count |
| Win rate (vs this competitor) | % |
| Baseline win rate | % |
| Delta | pp — negative = this competitor hurts |
| $ at risk (active deals) | Open deal value where competitor is present — sorted by this |

---

### Tab 3: Accounts — How are customers doing?

**Primary users:** CS rep (daily triage) · CS manager · Exec
**Narrative arc:** How is retention trending → which accounts need action today → what product promises are outstanding → is revenue growing or shrinking

#### Section 1 — 3 KPI cards
*KPI Metric × 3*

| KPI | Notes |
|---|---|
| NRR trailing 90d | vs 100% target |
| At-risk MRR | $ from Critical + Watch tier accounts |
| Renewals ≤30d | Count + total MRR at stake |

#### Section 2 — Customer triage table (PRIMARY content)
*Data Table — conditional row formatting*

One table replaces the four separate widgets from earlier versions (dark accounts list, overdue check-ins, open issues, at-risk alerts). They were showing the same accounts from different angles — this consolidates them.

Sorted: Critical → Watch → Healthy, then by MRR within tier.

| Column | Notes |
|---|---|
| Account | — |
| MRR | $ |
| Plan | Tier |
| Days since contact | Red >60d, amber 31–60d |
| Renewal in | Days — red ≤30d |
| Open issues | Count — red ≥3 |
| Health | Pill: Critical / Watch / Healthy |
| Recommended action | "Book call today", "Resolve ticket #12", "Expansion opportunity — new plan launched" |

Health score logic (visible, not hidden):
- Critical: renewal ≤30d AND (dark >60d OR ≥3 open issues)
- Watch: dark 31–60d OR renewal 31–60d OR 1–2 open issues
- Healthy: contact <30d AND no imminent renewal AND ≤0 open issues

#### Section 3 — Promise tracker
*Data Table — compact*

| Column | Notes |
|---|---|
| Feature shipped | — |
| Customers to notify | Count |
| Notified | % complete |
| Owner | Rep name |
| Days since ship | Red if >14 |

CS rep's follow-through queue. Placed after triage so daily action (triage) comes before the product loop-closing work.

#### Section 4 — Revenue health (manager/exec view)
*Stacked Area Chart + Line Chart — side by side*

Left: MRR components — new + expansion (above axis) vs contraction + churn (below axis). At a glance: is revenue momentum positive or negative?
Right: NRR rolling 90d with 100% reference line. If the area chart looks messy, the NRR line tells you the net result.

---

### What changed from v6

| v6 | v7 |
|---|---|
| 4 tabs with an Overview as entry point | 4 tabs with Overview as a real read — unique charts, not summaries |
| Pipeline had My Deals / Team Health toggle | No toggle — rep filter applies globally across all tabs |
| Win/Loss led with KPI cards | Win/Loss leads with the loss reason chart (the actual story) |
| "Customers" tab | "Accounts" tab — matches B2B SaaS language |
| Each tab at equal visual weight | Each tab has a narrative arc — read top to bottom, not scan a grid |

