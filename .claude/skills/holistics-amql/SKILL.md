---
name: holistics-amql
description: Expert at writing Holistics AMQL code — models, dimensions, measures, metrics, datasets, relationships, and AQL expressions. Use this skill whenever the user asks to define metrics, write measures, build semantic models, create datasets, set up relationships, or write AQL queries in Holistics 4.0. Trigger for any request involving Holistics data modeling, semantic layer, AML files (.model.aml, .dataset.aml), or analytics-as-code in Holistics. Even if the user just mentions "Holistics metric", "Holistics model", or "AQL", use this skill.
---

# Holistics AMQL Expert

You are an expert in **AMQL** — Holistics 4.0's Analytics Modeling and Querying Language. Your job is to write correct, idiomatic, production-ready AML/AQL code.

**References** (read these when you need depth):
- `references/amql-holistics.md` — full AQL/AML syntax, functions, operators
- `references/modeling-patterns.md` — star, galaxy, snowflake, role-playing patterns
- `references/datasets-and-relationships.md` — datasets, relationships, path ambiguity, dataset dimensions

---

## Core mental model

AMQL = **AML** (declarative modeling) + **AQL** (metrics-centric query language).

Pipeline: **Database Tables → Models** (`.model.aml`) **→ Datasets** (`.dataset.aml`) **→ Dashboards** (`.page.aml`)

Key principle: **models represent database tables; datasets are the semantic layer where metrics live**.

---

## Fact vs. Dimension models

The most important classification in Holistics modeling:

| | Dimension model | Fact model |
|---|---|---|
| **Contains** | Descriptive attributes (who, what, where) | Events & transactions (how many, how much) |
| **Examples** | `users`, `products`, `countries` | `orders`, `order_items`, `page_views` |
| **Relationship side** | "one" side (`1`) | "many" side (`N`) |
| **Rows** | Fewer, unique per entity | Many, one per event |
| **Has measures?** | Rarely | Yes — revenue, count, qty |

Quick rule: if you'd define a metric on it → fact model. If you'd group/filter by it → dimension model.

---

## How to help the user

1. **Classify the data** — identify fact vs. dimension tables before writing any code
2. **Choose the modeling pattern** — star (most common), galaxy, snowflake, or role-playing; see `references/modeling-patterns.md`
3. **Choose the right construct**:
   - Raw table → `Model` with `type: 'table'`
   - Derived/joined table → `Model` with `type: 'query'`
   - Simple per-model aggregation → `measure` inside the model
   - Cross-model or reusable metric → `metric` inside the dataset
   - Non-aggregated field → `dimension` inside the model
   - Cross-model derived field → `dimension` inside the dataset (AQL only)
4. **Watch for path ambiguity** — when two models can be joined via multiple paths, use `with_relationships()`
5. **Explain key decisions** — especially around fan-out, `aggregation_type`, LoD, and relationship direction

---

## Critical rules (these cause bugs if broken)

**Measures:**
- Never define an aggregate function in BOTH `aggregation_type` AND the `definition`. Use one or the other.
  - OK: `definition: @sql {{ id }};;` + `aggregation_type: 'count'`
  - OK: `definition: @sql count({{ #SOURCE.amount }});;` + `aggregation_type: 'custom'`
  - OK: `definition: @aql count(orders.id);;` (no `aggregation_type` needed for AQL)
  - WRONG: `definition: @sql count({{ id }});;` + `aggregation_type: 'count'`

**Relationships:**
- The "one" side **must** have unique values — non-unique "one" side causes fan-out errors
- Many-to-one: `relationship(fact.fk > dimension.pk, true)` — arrow from many to one
- One-to-one: `relationship(a.id - b.id, true)`
- Only one relationship between two models can be active at a time; use `with_relationships()` for role-playing or path disambiguation

**Cross-model aggregation:**
- When aggregating across related tables, specify the aggregation table explicitly:
  `sum(order_items, order_items.qty * products.price)` — `order_items` is the N-side

**Dataset dimensions:**
- AQL only (no SQL) — must include `model:` parameter specifying the starting model
- When the source model is on the "one" side of a relationship, must aggregate the many-side to avoid fan-out: `min(orders.created_at | month()) | dimensionalize(users.id)`

**Path ambiguity:**
- When multiple join paths exist between models, Holistics auto-ranks them (Tier 1 = dimension→fact preferred)
- For role-playing dimensions (multiple FK to same dimension, e.g. `created_date`, `shipped_date`), disable default relationships and use `with_relationships()` explicitly

**AQL operators on datetimes:**
- `==` matches an exact timestamp; `is`/`matches` matches an entire period (e.g., all of 2022)
- AQL returns `null` (not `0`) when no data matches — use `coalesce()` for defaults
- Use `safe_divide()` to prevent division-by-zero

**Primary keys:**
- Always define `primary_key: true` on the unique identifier — enables query optimization and AQL features

---

## Quick syntax reference

### Dimension model
```aml
Model users {
  type: 'table'
  table_name: 'ecommerce.users'
  data_source_name: 'mydb'

  dimension id        { type: 'number'; primary_key: true }
  dimension name      { type: 'text' }
  dimension country   { type: 'text' }
  dimension joined_at { type: 'datetime' }
}
```

### Fact model with measures
```aml
Model orders {
  type: 'table'
  table_name: 'ecommerce.orders'
  data_source_name: 'mydb'

  dimension id         { type: 'number'; primary_key: true }
  dimension user_id    { type: 'number' }
  dimension status     { type: 'text' }
  dimension created_at { type: 'datetime' }
  dimension amount     { type: 'number' }

  measure total_orders {
    type: 'number'
    definition: @sql {{ id }};;
    aggregation_type: 'count'
  }
  measure revenue {
    type: 'number'
    definition: @sql sum({{ #SOURCE.amount }});;
    aggregation_type: 'custom'
  }
}
```

### Dataset with relationships and metrics
```aml
Dataset ecommerce {
  label: 'Ecommerce'
  data_source_name: 'mydb'
  models: [orders, users, products, order_items]

  relationships: [
    relationship(orders.user_id > users.id, true),
    relationship(order_items.order_id > orders.id, true),
    relationship(order_items.product_id > products.id, true)
  ]

  // Simple count metric
  metric total_orders {
    label: 'Total Orders'
    type: 'number'
    definition: @aql count(orders.id);;
  }

  // Cross-model metric (specify N-side table explicitly)
  metric revenue {
    label: 'Revenue'
    type: 'number'
    definition: @aql sum(order_items, order_items.qty * products.price);;
  }

  // Composed metric (references other metrics)
  metric aov {
    label: 'AOV'
    type: 'number'
    definition: @aql safe_divide(revenue, total_orders);;
  }

  // Filtered metric
  metric completed_orders {
    label: 'Completed Orders'
    type: 'number'
    definition: @aql count(orders.id) | where(orders.status == 'completed');;
  }

  // Cross-model dataset dimension (cohort — source on "one" side must use dimensionalize)
  dimension acquisition_cohort {
    model: users
    type: 'date'
    label: 'Acquisition Cohort'
    definition: @aql min(orders.created_at | month()) | dimensionalize(users.id);;
  }
}
```

### Role-playing dimensions (path ambiguity)
```aml
Dataset orders_ds {
  models: [orders, date_dim]

  relationships: [
    relationship(orders.created_date_id > date_dim.id, false),  // inactive by default
    relationship(orders.shipped_date_id > date_dim.id, false)   // inactive by default
  ]

  metric orders_by_created_date {
    definition: @aql count(orders.id) | with_relationships(orders.created_date_id > date_dim.id);;
  }
  metric orders_by_shipped_date {
    definition: @aql count(orders.id) | with_relationships(orders.shipped_date_id > date_dim.id);;
  }
}
```

---

## Metric patterns cheatsheet

| Goal | AQL pattern |
|------|-------------|
| Count of rows | `count(orders.id)` — use PK |
| Sum of a column | `sum(orders.amount)` |
| Cross-model revenue | `sum(order_items, order_items.qty * products.price)` |
| Filtered metric | `base_metric \| where(dim.field == 'value')` |
| MoM comparison | `metric \| relative_period(date_dim, interval(-1 month))` |
| YTD | `metric \| period_to_date('year', date_dim)` |
| Running total | `running_total(metric, date_dim \| month())` |
| % of total | `safe_divide(metric, metric \| of_all(grouping_model))` |
| Cohort (acquisition) | `min(events.date \| month()) \| dimensionalize(users.id)` |
| Composed metric | Reference other metrics directly: `safe_divide(revenue, orders)` |
| Null-safe division | `safe_divide(numerator, denominator)` |

---

## Modeling pattern selection

| Pattern | Use when |
|---------|----------|
| **Star** | Single business process, simple queries, performance priority |
| **Galaxy** | Multiple fact tables sharing dimension tables |
| **Snowflake** | Normalized source data, dimension hierarchies |
| **Role-playing** | Same dimension table used multiple ways (e.g. created/shipped date) |

See `references/modeling-patterns.md` for full examples.
