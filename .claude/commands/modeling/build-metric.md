# Build a Metric (AMQL)

This workflow helps you **design and build analytical constructs** in Holistics — dimensions, measures, metrics, and AQL expressions — by working through the business logic first before writing any code.

Use this when you need to:
- Define a new metric or KPI in Holistics
- Add dimensions or measures to an existing model
- Build a dataset with relationships and cross-model calculations
- Write or debug AQL expressions

**Reference:** Read `.claude/commands/modeling/_holistics-patterns.md` before Step 5 for naming conventions, pattern selection, fan-out rules, path ambiguity, and filter direction. Do not duplicate that content here — link to it.

---

## Step 0 — Detect intent

Before doing anything, ask:

1. **Are you building something new or reviewing existing code?**
   - Building new → go to Step 1
   - Reviewing / fixing existing code → ask them to share it, then jump to Step 4 (validation)

2. **What stage are you at?**
   - I have a business question but haven't started → start from Step 1
   - I know what I want to build (dimension / measure / metric / dataset) → skip to Step 3
   - I have tables and just need the AML code → jump to Step 4

3. **Do you have access to the underlying tables/schema?**
   - Yes → share table names and key columns now
   - No → Claude will use placeholder names, you can fill them in later

---

## Step 1 — Understand the business question

Before touching any code, understand *why* this metric exists.

Ask:
1. **What decision does this metric support?** Who looks at it and what action do they take based on it?
2. **Describe the metric in one sentence** without using any technical terms. Example: *"The percentage of deals that resulted in a closed-won out of all deals that reached the proposal stage."*
3. **What does a good vs. bad value look like?** (Helps catch formula direction errors early.)
4. **Is this already tracked somewhere** — in a BI tool, spreadsheet, or another system? If so, what's the existing formula?

Write the plain-language definition down before moving on. This becomes the source of truth if the code drifts.

---

## Step 2 — Define the grain and scope

The grain is the unit each row in the result represents. Getting this wrong causes fan-out or undercounting.

Ask:
1. **What is one row in the result?** (e.g., one order, one user per month, one deal per stage)
2. **What's the time dimension?** (e.g., created_at, closed_at, event_date — pick one and be explicit)
3. **What should be included / excluded?**
   - Filters that are always true (e.g., "only status = delivered", "only paying customers")
   - Edge cases that should be excluded (e.g., "exclude internal test accounts", "exclude $0 orders")
4. **Is this a point-in-time value or does it accumulate?** (e.g., MRR is point-in-time; cumulative revenue accumulates)

---

## Step 3 — Choose the right construct

Use this decision guide:

| I want to... | Use this |
|---|---|
| Map a DB table to Holistics | `Model` (type: `'table'`) |
| Write a custom SQL join across multiple tables | `Model` (type: `'query'`) |
| Add a non-aggregated field (label, category, date) | `dimension` on a Model |
| Add an aggregated field (count, sum, average) scoped to one model | `measure` on a Model |
| Calculate something that spans multiple models | `metric` on a Dataset |
| Compose a metric from other metrics | `metric` referencing other metrics |
| Attach an aggregate value back to a row-level dimension | `dimensionalize()` in a `dimension` |
| Compare this period vs. last period | `relative_period()` in a `metric` |
| Calculate % of total | `of_all()` + `safe_divide()` |
| Show a running cumulative | `running_total()` |
| Build a retention / cohort analysis | `dimensionalize()` + `date_diff()` |

If unsure, describe what you want in plain language and Claude will recommend the right construct.

---

## Step 4 — Work through the formula logic

Before writing AML, write out the formula in pseudocode or plain math. This catches logic errors before they become code errors.

Template:
```
Metric: [name]
Definition: [one sentence]
Numerator: count of [what], where [conditions]
Denominator: count of [what], where [conditions]  (if ratio)
Time dimension: [field name] on [table]
Always-on filters: [e.g., status = 'delivered']
Edge cases:
  - What if denominator = 0? → use safe_divide()
  - What if no data for a period? → coalesce to 0 or leave null?
  - Are there multiple join paths to [table]? → which one is correct?
```

Walk through this explicitly for anything non-trivial. Only move to Step 5 once the logic is unambiguous.

---

## Step 5 — Write the AML code

Now translate the formula into AML. Produce complete, copy-pasteable code blocks. Always include:
- Correct file naming: `<name>.model.aml`, `<name>.dataset.aml`
- All required fields (`label`, `type`, `definition`)
- Relationships if joining models
- Brief inline comments for non-obvious logic

After writing, explain what each key piece does in plain language — especially any AQL functions that aren't self-evident.

---

## Step 6 — Validate

Check the generated code against these rules before delivering:

**Must-have:**
- `primary_key: true` is set on the unique identifier of every Model
- Aggregate function is in either `aggregation_type` OR `definition` — never both
- Multi-model aggregation passes the source table as first arg: `sum(order_items, order_items.qty * products.price)`
- `dimensionalize()` appears at most once per dimension, at the top level only
- `dimensionalize()` is only used inside `dimension` definitions, never inside `metric`
- `/` is replaced with `safe_divide()` wherever division occurs
- `coalesce()` wraps any metric that should return 0 instead of null
- Every `group()` is followed by `select()` or `filter()`
- `where()` is used instead of `filter()` inside metric definitions

**Path ambiguity check:**
If any model is reachable via more than one join path in the dataset, document which path to use and which to omit. Reference the Holistics path ambiguity docs if needed.

---

## When building a full dataset (not just a metric)

If the user needs a complete `.dataset.aml` file — not just a single metric — follow this checklist before writing any code:

1. **Choose the pattern** (star / galaxy / snowflake / role-playing) — see `_holistics-patterns.md` §1
2. **Apply naming conventions** — `fct_`, `dim_`, `stg_` prefixes; `total_`, `count_`, `pct_` for measures — see `_holistics-patterns.md` §2
3. **Set up `dim_dates`** if any metric needs time-axis comparison across multiple fact tables — see `_holistics-patterns.md` §4
4. **Declare all relationships in `relationships.aml`** — not inline in the dataset file
5. **Set `filter_direction`** on each relationship:
   - Galaxy schema → `'one_way'` on all fact-to-dim relationships
   - 1:1 or intentional cross-filtering → `'two_way'`
6. **Flag path ambiguity** — for any model reachable via 2+ paths, document which path is active and why
7. **Hide FK/technical fields** — `hidden: true` on all foreign key columns and sort helpers
8. **Keep dataset size focused** — 4–7 models per dataset; create separate datasets for different use cases

Produce files in this order: `relationships.aml` → `<name>.model.aml` files → `<name>.dataset.aml`

---

## AML code reference

### Model (table)
```aml
Model orders {
  type: 'table'
  label: "Orders"
  table_name: 'schema.orders'
  data_source_name: 'my_db'

  dimension id {
    label: 'Order ID'
    type: 'number'
    primary_key: true
    definition: @sql {{ #SOURCE.id }};;
  }
  dimension status {
    label: 'Status'
    type: 'text'
    definition: @sql {{ #SOURCE.status }};;
  }
  dimension created_at {
    label: 'Created At'
    type: 'datetime'
    // no definition → auto-maps to column name
  }
  measure total_orders {
    label: 'Total Orders'
    type: 'number'
    definition: @sql {{ id }};;
    aggregation_type: 'count'
  }
  measure total_revenue {
    label: 'Total Revenue'
    type: 'number'
    definition: @sql sum({{ #SOURCE.amount }});;
    aggregation_type: 'custom'
  }
}
```

### Model (query — custom SQL join)
```aml
Model location {
  type: 'query'
  data_source_name: 'my_db'
  models: [cities, countries]

  query: @sql
    select {{ #ci.id }} as city_id, {{ #ci.name }} as city_name,
           {{ #co.code }} as country_code, {{ #co.name }} as country_name
    from {{ #cities as ci }}
    left join {{ #countries as co }} on {{ #co.code }} = {{ #ci.country_code }};;

  dimension city_id   { type: 'number'; primary_key: true }
  dimension city_name { type: 'text' }
}
```

### Dataset with relationships and metrics
```aml
Dataset ecommerce {
  label: 'Ecommerce'
  data_source_name: 'my_db'
  models: [orders, users, products]

  relationships: [
    relationship(orders.user_id > users.id, true),
    relationship(orders.product_id > products.id, true)
  ]

  dimension full_name {
    model: users
    type: 'text'
    definition: @aql concat(users.first_name, ' ', users.last_name);;
  }

  metric revenue {
    label: 'Revenue'
    type: 'number'
    definition: @aql sum(orders.amount);;
  }
  metric aov {
    label: 'AOV'
    type: 'number'
    definition: @aql safe_divide(revenue, count(orders.id));;
  }
}
```

---

## AQL patterns

### Filtering (always use where() in metrics)
```aql
revenue | where(orders.status == 'delivered')
count(users.id) | where(users.country == 'Vietnam')
revenue | where(orders.created_at matches @(last 30 days))
```

### Period-over-period
```aql
metric revenue_last_month {
  definition: @aql revenue | relative_period(orders.created_at, interval(-1 month));;
}
metric revenue_growth {
  definition: @aql safe_divide((revenue - revenue_last_month) * 100.0, revenue_last_month);;
}
metric ytd_revenue {
  definition: @aql revenue | period_to_date('year', orders.created_at);;
}
metric cumulative_revenue {
  definition: @aql running_total(revenue, orders.created_at | month());;
}
```

### Percent of total
```aql
safe_divide(count(orders.id) * 100.0, count(orders.id) | of_all(countries))
safe_divide(revenue * 100.0, revenue | of_all(products.name))
```

### Row-level dimension from aggregate (dimensionalize)
```aql
// Customer LTV attached back to each user row
dimension customer_ltv {
  model: users; type: 'number'
  definition: @aql sum(orders.amount) | dimensionalize(users.id);;
}
// Acquisition cohort month
dimension acquisition_cohort {
  model: users; type: 'date'
  definition: @aql min(orders.created_at | month()) | dimensionalize(users.id);;
}
```

### Cohort retention
```aql
dimension month_no {
  model: orders; type: 'number'
  definition: @aql date_diff('month', acquisition_cohort, orders.created_at | month());;
}
metric retention {
  definition: @aql (count(users.id) * 1.0) / (count(users.id) | of_all(orders.month_no));;
}
```

### Nested aggregation (higher level of detail)
```aql
metric avg_monthly_signups {
  definition: @aql
    users
    | group(users.created_at | month())
    | select(monthly_count: count(users.id))
    | avg(monthly_count);;
}
```

### Time functions
```aql
orders.created_at | month()        // truncate to month
orders.created_at | year()
orders.created_at | month_num()    // extract month number
date_diff('day', orders.created_at, @now)
date_format(orders.created_at, '%Y-%m-%d')
```

### Datetime literals
```aql
@2023-04-01
@now  @today  @yesterday
@(last 7 days)  @(last 3 months)  @(this year)
// Use 'is' for period matching, '==' for exact timestamp
orders.created_at is @2022          // within the entire year
orders.created_at matches @(last 30 days)
```

---

## Order of operations (for debugging LoD issues)

1. Create model CTEs
2. Apply query params
3. Execute AQL dimensions
4. Ignore excluded dimensions from filters (`of_all()`)
5. Apply filters on non-excluded dimensions (before aggregation)
6. Execute aggregation / metric logic
7. Apply filters on measures / metrics (after aggregation)

---

## Common errors

| Error | Cause | Fix |
|---|---|---|
| ERR-101 | Referenced field doesn't exist in scope | Check model/dataset includes the field |
| ERR-102 | Unsupported operator for type (`+` on text) | Use `concat()` for text |
| WARN-300 | `group()` without `select()` or `filter()` | Always follow `group()` |
| Fan-out | Relationship "one" side has duplicates | Ensure primary key is truly unique |
| Division by zero | Using `/` operator | Replace with `safe_divide()` |
| Null instead of 0 | No data matches filter | Wrap with `coalesce(..., 0)` |
