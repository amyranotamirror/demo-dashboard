# Seed Data Specification

<!-- TOC -->

- [How dates work](#how-dates-work)
- [Row counts](#row-counts)
- [Deal distribution (~700 total over 4 years)](#deal-distribution-700-total-over-4-years)
- [Call distribution (~2,400 total)](#call-distribution-2400-total)
- [companies — seed these exactly](#companies--seed-these-exactly)
- [persons — internal team (seed exactly, model turnover)](#persons--internal-team-seed-exactly-model-turnover)
- [call_attendees](#call_attendees)
- [raw_inputs — enum weights](#raw_inputs--enum-weights)
- [deals — enum weights](#deals--enum-weights)
- [subscriptions — plan distribution](#subscriptions--plan-distribution)
- [Product taxonomy — seed exactly](#product-taxonomy--seed-exactly)
- [Date sequencing rules](#date-sequencing-rules)

<!-- /TOC -->

---

This file tells you what fake data to generate for each table, how much of it, and what values to use. The goal is a demo dataset that tells a coherent story — a sales team with a mix of active deals, past wins and losses, and a live customer base.

---

## How dates work

All dates use an offset so the demo never looks stale, regardless of when you generate it:

```
offset = today() - DATE_GENERATED
each date = original_date + offset
```

```js
const DATE_GENERATED = new Date('2026-01-01'); // set once, never change
const offset = differenceInDays(new Date(), DATE_GENERATED);
const shift = (d) => addDays(new Date(d), offset);

// Example: a deal created on 2025-10-01 will always appear ~3 months ago
deal.created_at = shift('2025-10-01');
```

---

## Row counts

| Table | Rows | Notes |
|---|---|---|
| `companies` | ~320 | 1 internal + 20 competitors + ~300 prospects/customers (active + churned over 4 years) |
| `persons` | ~750 | ~20 internal (with turnover) + 2–4 contacts per prospect/customer company |
| `calls` | ~2,400 | ~3–4 per pre-sale deal + ~6 per subscription over lifetime |
| `call_attendees` | ~6,000 | 2–6 attendees per call; every call has exactly one host |
| `raw_inputs` | ~4,500 | variable per call: 1 for quick check-ins, 5–15 for demos/evals, 20–50 for first meetings |
| `deals` | ~700 | breakdown below |
| `deal_stage_history` | ~1,800 | avg 3–4 stage rows per in_progress / won / lost deal |
| `subscriptions` | ~380 | one per won deal (new + renewal + upgrade + downgrade) |
| `themes` | 5 | seed exactly — see values below |
| `use_cases` | 15 | 2–4 per theme — seed exactly |
| `features` | 30 | 1–3 per use case — seed exactly |
| `improvements` | 60 | product team's open customer problems |

---

## Deal distribution (~700 total over 4 years)

| deal_type | status | Count | Notes |
|---|---|---|---|
| `new` | `won` | 130 | Each has a subscription |
| `new` | `lost` | 160 | Mix of all lost_reasons |
| `new` | `ghost` | 40 | No activity in 45+ days; ~30% have `follow_up_at` set |
| `new` | `in_progress` | 25 | Spread across all 5 stages; at least 5 active at any given month |
| `upgrade` | `won` | 55 | Linked to a previous `new` or `renewal` deal |
| `upgrade` | `lost` | 20 | |
| `upgrade` | `in_progress` | 10 | |
| `downgrade` | `won` | 30 | Linked to a previous deal; customer moved to lower plan |
| `renewal` | `won` | 130 | Has a subscription; linked to previous deal |
| `renewal` | `churned` | 50 | |
| `renewal` | `in_progress` | 30 | Upcoming renewals within next 60 days |
| `renewal` | `lost` | 20 | Tried to renew, prospect declined |

**Weekly event density target:**
At least 1–2 deal events per week across the 4-year history. An "event" = a deal created, stage changed, won, lost, ghosted, or a ghost reactivated.

**Ghost-then-return pattern (seed explicitly — ~15 deals):**
A deal goes `ghost` → rep sets `follow_up_at` → on that date the deal moves back to `in_progress` at the same or earlier stage. Some of these then close (won or lost), others ghost again.

**Deal cohort — spread across 4 years:**

| Cohort | created_at range | Typical outcome |
|---|---|---|
| Oldest | 46–48 months ago | won with full renewal chain, or lost early |
| Early growth | 36–46 months ago | won → renewed 1–2x, or churned |
| Mid | 18–36 months ago | won (some churned), lost, upgrade/downgrade chain |
| Recent closed | 6–18 months ago | won (active subscription) or lost |
| Active pipeline | 1–6 months ago | in_progress at various stages |
| New/fresh | 0–4 weeks ago | qualifying or validating |

---

## Call distribution (~2,400 total)

| phase | count | guidance |
|---|---|---|
| `pre_sale` | ~1,500 | ~3–4 calls per deal (in_progress + won + lost); mix of discovery, demo, evaluation, negotiation |
| `post_sale` | ~900 | ~6 calls per subscription over its lifetime; mix of onboarding, check_in, renewal |

**Attendee count per call:** 2–6 people. Every call has exactly one `host` (internal rep). Remaining attendees are a mix of internal and external persons. Bias toward smaller calls (2–3 people) for check-ins; larger (4–6) for discovery, demo, and negotiation calls.

**Raw inputs per call:**
- Quick check-in / renewal call: 1–3 inputs
- Demo or evaluation call: 5–15 inputs
- First discovery meeting (never met before): 20–50 inputs — this is where most product signals come from

---

## companies — seed these exactly

**Internal (1 row):**

| name | type |
|---|---|
| Holistics | `internal` |

**Competitors (20 rows) — seed exactly, don't randomize names:**

Scope: analytics vendors broadly (BI, embedded analytics, data apps, self-service SQL). Not limited to BI tools.

| name | website | type |
|---|---|---|
| Metabase | metabase.com | `competitor` |
| Looker | looker.com | `competitor` |
| Tableau | tableau.com | `competitor` |
| Power BI | powerbi.microsoft.com | `competitor` |
| Sigma | sigmacomputing.com | `competitor` |
| Redash | redash.io | `competitor` |
| Apache Superset | superset.apache.org | `competitor` |
| Mode | mode.com | `competitor` |
| Domo | domo.com | `competitor` |
| ThoughtSpot | thoughtspot.com | `competitor` |
| Qlik | qlik.com | `competitor` |
| MicroStrategy | microstrategy.com | `competitor` |
| Sisense | sisense.com | `competitor` |
| Grafana | grafana.com | `competitor` |
| Retool | retool.com | `competitor` |
| Observable | observablehq.com | `competitor` |
| Hex | hex.tech | `competitor` |
| Lightdash | lightdash.com | `competitor` |
| GoodData | gooddata.com | `competitor` |
| Omni | omni.co | `competitor` |

**Prospects / Customers (~300 rows) — use real company names:**

Use real companies that plausibly use analytics tools (data-driven teams in SEA, APAC, and global tech). Populate `website` and `logo_url` using `https://logo.clearbit.com/{domain}`.

Seed at least the following real companies. Generate the remaining rows using the same pattern with `faker.company.name()` for less prominent entries.

| name | website | industry | country | type |
|---|---|---|---|---|
| Grab | grab.com | Super App | Singapore | `customer` |
| Gojek | gojek.com | Super App | Indonesia | `customer` |
| Shopee | shopee.com | E-commerce | Singapore | `customer` |
| Tokopedia | tokopedia.com | E-commerce | Indonesia | `customer` |
| Traveloka | traveloka.com | Travel | Indonesia | `customer` |
| Carousell | carousell.com | Marketplace | Singapore | `customer` |
| Ninja Van | ninjavan.com | Logistics | Singapore | `customer` |
| Xendit | xendit.co | Fintech | Indonesia | `customer` |
| StashAway | stashaway.com | Fintech | Singapore | `customer` |
| PropertyGuru | propertyguru.com.sg | Real Estate | Singapore | `customer` |
| Mekari | mekari.com | SaaS | Indonesia | `customer` |
| ShopBack | shopback.com | E-commerce | Singapore | `customer` |
| Kredivo | kredivo.com | Fintech | Indonesia | `customer` |
| VNG Corporation | vng.com.vn | Technology | Vietnam | `customer` |
| Bukalapak | bukalapak.com | E-commerce | Indonesia | `customer` |
| Pomelo Fashion | pomelofashion.com | Retail | Thailand | `customer` |
| 2C2P | 2c2p.com | Fintech | Singapore | `customer` |
| Carsome | carsome.com | Automotive | Malaysia | `customer` |
| Funding Societies | fundingsocieties.com | Fintech | Singapore | `customer` |
| Anchanto | anchanto.com | SaaS | Singapore | `customer` |
| SIRCLO | sirclo.com | E-commerce SaaS | Indonesia | `customer` |
| Coda Payments | codapayments.com | Fintech | Singapore | `customer` |
| iPrice Group | iprice.asia | E-commerce | Malaysia | `customer` |
| Akulaku | akulaku.com | Fintech | Indonesia | `customer` |
| Omise | omise.co | Fintech | Thailand | `customer` |
| Doctor Anywhere | doctoranywhere.com | Healthcare | Singapore | `prospect` |
| Advance Intelligence | advance.ai | AI / Fintech | Singapore | `prospect` |
| Kumu | kumu.ph | Media | Philippines | `prospect` |
| GoTo Financial | gotofinancial.com | Fintech | Indonesia | `prospect` |
| Lazada | lazada.com | E-commerce | Singapore | `prospect` |

**Company type lifecycle:**
- Start as `prospect` when first contacted
- Become `customer` when first deal is won
- Remain `customer` even if churned (churn is on the subscription/deal, not the company)
- A churned customer who re-engages gets a new `new` deal while still typed as `customer`

**Active customer count over time:**
Model the fluctuation across 4 years:
- Year 1 (months 1–12): ramp from ~20 to ~80 active customers
- Year 2 (months 13–24): grow from ~80 to ~150
- Year 3 (months 25–36): peak ~200, some churn starts
- Year 4 (months 37–48): ~200–220 active, healthy churn/new balance

---

## persons — internal team (seed exactly, model turnover)

Holistics internal team at full headcount. Model turnover by setting `left_at` on some employees and adding replacements who join later. Aim for ~2–3 turnover events per year across the team.

| role | count (peak) | notes |
|---|---|---|
| `ae` | 4 | Seed 4 named AEs; 1–2 left and were replaced over 4 years |
| `cs_rep` | 2 | Seed 2 CS reps; 1 turnover event |
| `manager` | 1 | Stable — seed 1, no turnover |
| `bizops` | 1 | Stable — seed 1, no turnover |
| `product` | 10 | Seed 10 PMs; 3–4 turnover events; PMs attend calls on discovery and feature discussions |
| `data_analyst` | 4 | Seed 4 DAs; 1–2 turnover events |
| `ceo` | 1 | Stable — joins only strategic or large enterprise calls |
| `cto` | 1 | Stable — joins only technically complex evaluation calls |

**Turnover pattern:** When an employee leaves, set `left_at` to a date within the 4-year window. Add a replacement row with `created_at` = 2–4 weeks after the predecessor's `left_at`. The replacement takes over as `host` on calls from that point forward.

**Story element:** One AE (highest performer, e.g. "Sarah Chen") left at month 30 — this should visibly dip win rate in the pipeline data for the following quarter.

**External contacts (2–4 per prospect/customer company):**

| Field | Generation |
|---|---|
| `name` | `faker.person.fullName()` |
| `email` | `faker.internet.email()` |
| `role` | Weighted: `champion` (30%) · `decision_maker` (25%) · `evaluator` (25%) · `end_user` (20%) |
| `left_at` | 5% chance — models contact turnover at customer companies |

---

## call_attendees

Every call must have exactly **one** `host` row (an internal rep). Add 1–5 additional `attendee` rows per call (total 2–6 per call).

| Field | Generation |
|---|---|
| `call_id` | FK to the call |
| `person_id` | host = internal rep (AE or CS); attendee = mix of internal and external |
| `role` | `host` for lead rep; `attendee` for others |

**Attendee composition by call type:**

| call type | typical total | internal attendees | external attendees |
|---|---|---|---|
| `discovery` | 4–6 | AE (host) + optionally 1 PM or DA | 2–3 customer contacts |
| `demo` | 3–5 | AE (host) + optionally 1 PM | 2–3 customer contacts |
| `evaluation` | 4–6 | AE (host) + CTO or DA on technical calls | 2–4 customer contacts |
| `negotiation` | 3–5 | AE (host) + optionally CEO on large deals | 2–3 decision makers |
| `onboarding` | 3–4 | CS rep (host) + optionally 1 DA | 2–3 customer contacts |
| `check_in` | 2–3 | CS rep (host) | 1–2 customer contacts |
| `renewal` | 3–4 | AE or CS rep (host) + optionally manager | 2–3 customer contacts |

**CEO/CTO join condition:** CEO joins `negotiation` calls where `deal_value_usd >= 18000`. CTO joins `evaluation` calls where the company has a technical evaluator attendee.

---

## raw_inputs — enum weights

**`input_type` for pre-sale calls (discovery, demo, evaluation):**

| Value | Weight |
|---|---|
| `feature_request` | 25% |
| `deal_breaker` | 10% |
| `excitement` | 10% |
| `feedback` | 10% |
| `ui_ux` | 10% |
| `performance` | 8% |
| `permission` | 8% |
| `onboarding_issue` | 5% |
| `testimonial` | 5% |
| `irrelevant` | 5% |
| `how_to` | 4% |

**`input_type` for post-sale inputs (check-ins, support, tickets):**

| Value | Weight |
|---|---|
| `how_to` | 22% |
| `bug` | 18% |
| `feature_request` | 15% |
| `feedback` | 12% |
| `ui_ux` | 10% |
| `performance` | 8% |
| `excitement` | 5% |
| `testimonial` | 5% |
| `permission` | 3% |
| `irrelevant` | 2% |

**`status` distribution (across all raw inputs):**

| Value | Weight |
|---|---|
| `new` | 20% |
| `valid` | 30% |
| `need_inputs` | 10% |
| `solved` | 15% |
| `informed` | 10% |
| `has_workaround` | 5% |
| `not_relevant` | 5% |
| `duplicated` | 5% |

**`source` distribution:**

| Value | Weight |
|---|---|
| `call` | 65% |
| `ticket` | 25% |
| `email` | 10% |

**`competitor_id` — set on any input where a competitor was mentioned (not tied to a specific `input_type`):**

Assign a `competitor_id` to ~20% of pre-sale inputs. Distribution:

| Competitor | Weight |
|---|---|
| Metabase | 25% |
| Tableau | 18% |
| Power BI | 15% |
| Looker | 12% |
| Sigma | 8% |
| Redash | 5% |
| Apache Superset | 5% |
| Qlik | 4% |
| Sisense | 3% |
| Others (split across remaining) | 5% |

---

## deals — enum weights

**`deal_type` distribution (across all deals):**

| Value | Weight | Notes |
|---|---|---|
| `new` | 50% | First deal per company |
| `renewal` | 33% | Linked to prior deal via `previous_deal_id` |
| `upgrade` | 11% | Linked to prior deal; `deal_value_usd` > predecessor |
| `downgrade` | 6% | Linked to prior deal; `deal_value_usd` < predecessor |

**`lost_reason` (for lost deals):**

| Value | Weight |
|---|---|
| `missing_feature` | 35% |
| `competitor_win` | 25% |
| `pricing` | 20% |
| `no_budget` | 10% |
| `ghosted` | 7% |
| `not_a_fit` | 3% |

**`follow_up_at` (for ghost and paused in_progress deals):**
- Set on 30% of `ghost` deals and 10% of `in_progress` deals
- Value: `deal.closed_at + random(30, 180) days` for ghosts; `today + random(14, 90) days` for active
- When `follow_up_at` is in the past and the deal is still `ghost`, the deal should have been reactivated (see ghost-then-return pattern above)

**`deal_value_usd`:**
`faker.helpers.arrayElement([500, 1200, 2400, 4800, 9600, 18000, 36000, 60000])`
For `upgrade` deals: value must be higher than predecessor subscription's `mrr_usd * 12`.
For `downgrade` deals: value must be lower than predecessor.

---

## subscriptions — plan distribution

`billing_cycle` = how often the customer is invoiced. `term_months` = how long before a renewal deal is needed. They are independent.

| plan_name | billing_cycle | mrr_usd | term_months | % of subscriptions |
|---|---|---|---|---|
| Starter | monthly | 99 | 6 | 10% |
| Starter | monthly | 99 | 12 | 8% |
| Starter | annual | 79 | 12 | 7% |
| Growth | monthly | 299 | 6 | 10% |
| Growth | monthly | 299 | 12 | 12% |
| Growth | annual | 239 | 12 | 10% |
| Growth | annual | 239 | 24 | 5% |
| Business | monthly | 799 | 12 | 12% |
| Business | annual | 639 | 12 | 10% |
| Business | annual | 639 | 24 | 8% |
| Enterprise | monthly | 1999 | 12 | 4% |
| Enterprise | annual | 1599 | 12 | 2% |
| Enterprise | annual | 1599 | 24 | 2% |

**`ended_at` rule:** `ended_at = started_at + term_months`. If the subscription is currently active (renewal deal not yet closed), `ended_at = NULL`.

**Renewal chain rule:** When a subscription ends, create a new deal of type `renewal` with `created_at` within 30 days of `ended_at`. If the renewal deal is won, create a new subscription row linked to it. If lost or churned, leave `ended_at` populated and no new subscription.

---

## Product taxonomy — seed exactly

Seed these rows exactly so the Market Signals tab tells a coherent story. Do not randomize names.

**Themes (5):**
`Collaboration` · `Data Governance` · `Reporting Speed` · `Integrations` · `Administration`

**Use Cases (sample — define 2–4 per theme):**

| Theme | Use Case |
|---|---|
| Collaboration | External sharing |
| Collaboration | Team workspaces |
| Data Governance | Column-level access control |
| Data Governance | Row-level security |
| Reporting Speed | Query caching |
| Reporting Speed | Pre-aggregation |
| Integrations | Warehouse connectors |
| Integrations | Reverse ETL / export |
| Administration | SSO / SAML |
| Administration | Audit logs |

**Features and Improvements:** create 1–3 features per use case, then attach improvements to features. Give ~30% of improvements `is_blocking = true` and ~20% a `status` of `shipped` (to populate the "Promise tracker" and "Shipped → follow up" widgets).

---

## Date sequencing rules

| Table | Rule |
|---|---|
| `deal_stage_history` | `entered_at` values must be chronological per deal; 7–30 days between stage changes |
| `calls` | `call_date` must be after `deals.created_at`; post-sale calls must be after `subscriptions.started_at` |
| `subscriptions` | `started_at` must be after `deals.closed_at`; `ended_at = started_at + term_months` (or NULL if still active) |
| `renewal deals` | `created_at` of the renewal deal within 30 days of the predecessor subscription's `ended_at` |
| `upgrade / downgrade deals` | `created_at` must be after the predecessor deal's `closed_at`; can happen mid-subscription |
| `raw_inputs` | `created_at` must match or follow the linked `call.call_date` |
| `improvements` | `created_at` can be any time after the earliest linked raw input; `updated_at >= created_at` |
| `persons.left_at` | Must be after `persons.created_at`; replacement employee's `created_at` within 30 days after |
| `deals.follow_up_at` | Must be in the future relative to when the deal went ghost or paused; for historical ghost-then-return deals, `follow_up_at` must be before the reactivation date |
| Overall time window | All data spans exactly 4 years back from today. Use `daysAgo(1460)` as the oldest anchor. |
