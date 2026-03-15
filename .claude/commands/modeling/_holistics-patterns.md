# Holistics Modeling Patterns Reference

This is a shared reference file. Read it when designing schemas (`build-data-model.md` step 3) or writing AML code (`build-metric.md` step 5).

---

## 1. Pattern Selection Guide

| Use case | Pattern | When to use |
|---|---|---|
| Single business process (e.g., orders only) | **Star schema** | Most dashboards — default choice |
| Multiple related processes sharing dims (e.g., orders + inventory) | **Galaxy schema** | When you need cross-fact metrics |
| Source is already normalized, dims change frequently | **Snowflake** | Rare — avoid unless forced |
| Same dim used multiple times in one fact (e.g., order_date, ship_date, deliver_date) | **Role-playing dims** | Whenever a fact has multiple date/user FKs |

### Star schema
One central fact table, multiple dimension tables. Most queries need only 1 join.
```aml
Dataset ecommerce {
  models: [fct_orders, dim_users, dim_products, dim_dates]
  relationships: [
    relationship(fct_orders.user_id > dim_users.id, true),
    relationship(fct_orders.product_id > dim_products.id, true),
    relationship(fct_orders.date_id > dim_dates.id, true)
  ]
}
```

### Galaxy schema (fact constellation)
Multiple fact tables share dimension tables. Use `filter_direction: 'one_way'` to prevent invalid cross-fact breakdowns (e.g., inventory metrics should not group by user dimensions).
```aml
Dataset ecommerce {
  relationships: [
    relationship(fct_orders.product_id > dim_products.id, true, 'one_way'),
    relationship(fct_inventory.product_id > dim_products.id, true, 'one_way')
  ]
}
```

### Role-playing dimensions
**Option A — `extend()`** (preferred): Creates separate model aliases pointing to the same table. All relationships can be simultaneously active.
```aml
Model created_date = dim_dates.extend({ label: 'Created Date' })
Model shipped_date = dim_dates.extend({ label: 'Shipped Date' })

Dataset orders {
  relationships: [
    relationship(fct_orders.created_date_id > created_date.id, true),
    relationship(fct_orders.shipped_date_id > shipped_date.id, true)
  ]
}
```

**Option B — `with_relationships()`**: Keep one default relationship active, override per-metric.
```aml
metric total_shipped_orders {
  definition: @aql
    count(fct_orders.id)
    | with_relationships(fct_orders.shipped_at > dim_dates.date);;
}
```

---

## 2. Naming Conventions

### Model names (snake_case, plural)
| Layer | Prefix | Example |
|---|---|---|
| Fact tables | `fct_` | `fct_orders`, `fct_events` |
| Dimension tables | `dim_` | `dim_users`, `dim_products` |
| Staging / base | `stg_` | `stg_raw_orders` |
| Query / transform | verb + entity | `map_users`, `dedup_orders` |

### Field names (snake_case)
- Foreign keys: `user_id`, `product_id` → always `hidden: true`
- Booleans: `is_active`, `has_subscription`, `is_internal`
- Dates: keep original `created_at`, `updated_at`
- Disambiguate in normalized models: `user_name` not just `name`

### Measure names
| Type | Pattern | Example |
|---|---|---|
| Count | `count_` | `count_orders` |
| Sum | `total_` | `total_revenue` |
| Average | `avg_` | `avg_order_value` |
| Ratio | `x_per_y` | `orders_per_user` |
| Percentage | `pct_x_over_y` | `pct_won_over_total` |

### Field labels (end-user facing)
- Use **Title Case, No Underscores**: `"Total Revenue"`, `"Created At"`
- Disambiguate cross-model fields: `"Order Created At"` not just `"Created At"`

---

## 3. Project Organization

Recommended folder structure:
```
models/
  01_base/        ← direct table models (stg_)
  02_transform/   ← query models with joins/transforms
  03_analytical/  ← use-case-specific models
datasets/
  by_team/        ← or by_domain/
dashboards/
relationships.aml ← centralize all relationship declarations here
```

**Rule:** Separate models from different data sources into different parent folders. Separate table models from query models.

---

## 4. Date Dimension Model

Always create a `dim_dates` model for any dashboard with time-based metrics — especially when comparing metrics from different fact tables on the same time axis.

```sql
-- Generate series (PostgreSQL)
SELECT date_d::date
FROM generate_series('2020-01-01'::date, '2030-12-31'::date, '1 day'::interval) date_d
```

```aml
Model dim_dates {
  type: 'query'
  query: @sql
    SELECT date_d::date,
           EXTRACT(year FROM date_d) AS year,
           EXTRACT(month FROM date_d) AS month,
           TO_CHAR(date_d, 'Month') AS month_name,
           EXTRACT(dow FROM date_d) AS day_of_week
    FROM generate_series('2020-01-01'::date, '2030-12-31'::date, '1 day'::interval) date_d;;

  dimension date_d { type: 'date'; primary_key: true }
  dimension year    { type: 'number' }
  dimension month   { type: 'number' }
}
```

**Why:** Without a date dim, comparing "signups per day" vs "orders per day" from different tables produces incorrect results (each metric's date field would cross-filter the other). The date dim is the shared anchor.

---

## 5. Fan-Out Rules

**What it is:** A LEFT JOIN where one row on the left matches multiple rows on the right, causing aggregations (SUM, COUNT) to produce inflated results.

**When it happens:** Joining a dimension (one side) to a fact table (many side) where the dimension is on the LEFT. Example: joining `dim_users` LEFT JOIN `fct_orders` and counting users.

**Holistics auto-handles fan-out** for measures defined with `aggregation_type` in AML. This protection does **not** apply to custom SQL measures.

**Rule:** Always define measures using `aggregation_type` or `@aql` definitions — never raw SQL aggregations — to get fan-out protection.

```aml
// SAFE — Holistics can protect this
measure total_revenue {
  definition: @sql {{ #SOURCE.amount }};;
  aggregation_type: 'sum'
}

// RISKY — bypasses fan-out protection
measure total_revenue {
  definition: @sql SUM({{ #SOURCE.amount }});;
  aggregation_type: 'custom'
}
```

---

## 6. Path Ambiguity

**What it is:** Multiple valid join paths exist between two models. Example: reaching `dim_countries` via `dim_users → cities → countries` (customer route) OR `merchants → cities → countries` (merchant route).

**Auto-resolution ranking:**
1. Tier 1 wins: pure dimension→fact (one-to-many) paths preferred
2. Higher weight wins: explicit `with_relationships()` beats defaults
3. Shorter path wins if all else equal
4. Tied paths → system warning → manual override required

**Fix option 1:** Disable the less-common relationship, re-enable per-metric with `with_relationships()`
```aml
relationships: [
  relationship(merchants.city_id > cities.id, false),  // disabled by default
]

metric revenue_by_merchant_country {
  definition: @aql sum(fct_orders.amount)
    | with_relationships(relationship(merchants.city_id > cities.id, true));;
}
```

**Fix option 2:** Duplicate the dimension model with a different name (`dim_merchant_cities` vs `dim_user_cities`) to eliminate ambiguity entirely.

---

## 7. Filter Direction

Controls which direction filters and groupings can flow between models.

| Value | Behavior | Use when |
|---|---|---|
| `'two_way'` (default) | Bidirectional — dimensions can filter facts AND facts can filter dimensions | 1:1 relationships, or when cross-filtering is intended |
| `'one_way'` | Dimension → Fact only | Star/galaxy schema standard; prevents invalid cross-fact breakdowns |

```aml
// Correct for galaxy schema — inventory metrics can't group by user dims
relationship(fct_orders.user_id > dim_users.id, true, 'one_way')
relationship(fct_inventory.product_id > dim_products.id, true, 'one_way')

// Override per metric when you need reverse direction
metric latest_signup_by_order_status {
  definition: @aql max(dim_users.sign_up_date)
    | with_relationships(relationship(fct_orders.user_id > dim_users.id, true, 'two_way'));;
}
```

**Rule of thumb:** Always use `'one_way'` in galaxy schemas. Use `'two_way'` only for 1:1 relationships or when you explicitly need facts to filter dimensions.

---

## 8. Dataset Design Principles

- **Size:** Keep datasets to 4–7 models per use case. Large datasets (10–15+) for org-wide use.
- **One JOIN away:** Pre-join and denormalize where possible — avoid chains longer than 2 hops in queries.
- **Star over snowflake:** Holistics recommends star schema for usability and performance. Use snowflake only if source is already normalized or hierarchy levels need independent maintenance.
- **Hide FK fields:** Foreign keys, technical IDs, and sort-helper fields should always be `hidden: true`.
- **Centralize relationships:** Declare all relationships in `relationships.aml`, not scattered across dataset files.
- **Pre-aggregate heavy models:** For large event/log tables, create a persisted Query Model with pre-aggregated data rather than exposing the raw table.
