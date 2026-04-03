# Datasets, Relationships & Path Ambiguity

## Dataset

A dataset is the **semantic layer** — a mini data mart that groups models, defines their relationships, and exposes metrics and dimensions to end users for exploration and charting.

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

  metric total_orders { ... }
  metric revenue      { ... }

  dimension acquisition_cohort { model: users; ... }
}
```

All charts must be built from a dataset. Dataset metrics and dimensions are visible to all users with access.

---

## Relationships

### Syntax (inline in dataset)

```aml
// Many-to-one: arrow from N-side to 1-side
relationship(orders.user_id > users.id, true)

// One-to-one: dash
relationship(users.profile_id - profiles.id, true)
```

Second argument (`true`/`false`) = active by default.

### Relationship types

| Symbol | Type | JOIN behavior |
|--------|------|---------------|
| `>` | Many-to-one | JOIN from many to one |
| `-` | One-to-one | FULL JOIN (bidirectional) |

No native many-to-many. Solve with a junction Query Model: `A → junction → B`.

### Fan-out errors

Fan-out occurs when the **"one" side** of a relationship has **non-unique values**. This creates a Cartesian product and inflates aggregations.

**Rule:** The model on the `1` side (right side of `>`) **must** have a unique primary key. Always set `primary_key: true` on that field.

### Composite keys

If joining on multiple columns, create a Custom Dimension that concatenates the columns, then define the relationship on that derived field.

---

## Dataset dimensions

Dataset-level dimensions handle cross-model derived fields that can't be expressed in a single model.

```aml
// AQL only — SQL not supported at dataset level
// `model:` parameter required — specifies the starting/anchor model
dimension dimension_name {
  model: anchor_model
  type: 'text' | 'number' | 'date' | 'datetime' | 'truefalse'
  label: 'Label'
  definition: @aql aql_expression;;
}
```

### Single-model dataset dimensions

If the dimension only references one model, define it in the model instead (better colocation).

### Cross-model dataset dimensions

Combining fields from multiple models.

**Source on the "many" side** (safe — no fan-out):
```aml
// orders is fact, users is dimension — orders is many-side
dimension order_status_label {
  model: orders
  type: 'text'
  definition: @aql orders.status;;
}
```

**Source on the "one" side** (fan-out risk — must aggregate the many-side):
```aml
// users is dimension (one-side), orders is fact (many-side)
// Must use dimensionalize() to avoid fan-out
dimension acquisition_cohort {
  model: users
  type: 'date'
  label: 'Acquisition Cohort'
  definition: @aql min(orders.created_at | month()) | dimensionalize(users.id);;
}
```

`dimensionalize(users.id)` collapses the many-side back to the one-side grain.

---

## Path ambiguity

### The problem

When two models can be connected via multiple valid join paths, the query result depends on which path is taken.

**Example:** `order_items` → "what country?" could mean:
- **Path A**: `order_items → orders → users → cities → countries` (customer country)
- **Path B**: `order_items → products → merchants → cities → countries` (merchant country)

These return different numbers with different business meanings.

### Holistics auto-resolution (4-tier ranking)

Holistics picks the best path automatically using:

1. **Tier 1** (best): paths with only dimension→fact direction (1→N)
2. **Tier 2**: paths with only fact→dimension direction (N→1)
3. **Tier 3**: paths through junction tables
4. **Tier 4**: mixed patterns

Within the same tier: higher `with_relationships()` weight wins, then shorter path wins.

When two paths tie → Holistics shows an ambiguity warning. Resolve manually.

### Manual resolution: `with_relationships()`

Force a specific path by specifying which relationships to activate for a metric:

```aml
// Customer country revenue
metric revenue_by_customer_country {
  definition: @aql sum(order_items, order_items.qty * products.price)
    | with_relationships(
        orders.user_id > users.id,
        users.city_id > cities.id,
        cities.country_id > countries.id
      );;
}

// Merchant country revenue — different path
metric revenue_by_merchant_country {
  definition: @aql sum(order_items, order_items.qty * products.price)
    | with_relationships(
        order_items.product_id > products.id,
        products.merchant_id > merchants.id,
        merchants.city_id > cities.id,
        cities.country_id > countries.id
      );;
}
```

### Manual resolution: duplicate dimension models

Create separate models wrapping the same table for each semantic role:

```aml
Model customer_cities   { type: 'query'; ... /* wraps cities */ }
Model merchant_cities   { type: 'query'; ... /* wraps cities */ }
```

This eliminates ambiguity structurally — each path uses a distinct model. Cleaner for dashboards but adds model count.

### Role-playing dimensions (special case)

When the same dimension table is referenced multiple times from one fact via different FK columns (e.g., `created_date_id`, `shipped_date_id` both → `date_dim`), auto-resolution always fails.

**Pattern:** set all those relationships to `false` (inactive), then activate per-metric with `with_relationships()`. See `modeling-patterns.md` for full example.

### Best practices

1. Trust auto-resolution for simple datasets — it works well for star schemas
2. Add `with_relationships()` only when you see ambiguity warnings or role-playing FKs
3. Comment complex metric definitions explaining which path is intentional
4. Test metrics with different dimension combinations to verify the correct path fires
