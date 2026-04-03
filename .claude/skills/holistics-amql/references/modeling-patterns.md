# Holistics Modeling Patterns

## Fact vs. Dimension — the core distinction

**Dimension tables** answer *who/what/where/when*:
- Unique primary key, fewer rows
- Descriptive attributes used for filtering and grouping
- Examples: `users`, `products`, `countries`, `date_dim`
- Form the **"one" side** of relationships

**Fact tables** answer *how many / how much*:
- Many rows, one per event or transaction
- Contain measures (revenue, qty, count)
- Reference dimensions via foreign keys
- Form the **"many" side** of relationships

Quick test: if you'd define a metric on it → fact. If you'd filter or group by it → dimension.

---

## Star Schema

One fact table connected to multiple dimension tables. Most common pattern.

```
users ←── orders ──→ products
              ↑
           date_dim
```

```aml
// Fact
Model orders {
  type: 'table'
  table_name: 'ecommerce.orders'
  data_source_name: 'mydb'

  dimension id         { type: 'number'; primary_key: true }
  dimension user_id    { type: 'number' }
  dimension product_id { type: 'number' }
  dimension created_at { type: 'datetime' }
  dimension amount     { type: 'number' }

  measure total_orders { type: 'number'; definition: @sql {{ id }};; aggregation_type: 'count' }
  measure revenue      { type: 'number'; definition: @sql sum({{ #SOURCE.amount }});; aggregation_type: 'custom' }
}

// Dimensions
Model users    { type: 'table'; table_name: 'ecommerce.users';    data_source_name: 'mydb'; dimension id { type: 'number'; primary_key: true } ... }
Model products { type: 'table'; table_name: 'ecommerce.products'; data_source_name: 'mydb'; dimension id { type: 'number'; primary_key: true } ... }

Dataset star_example {
  models: [orders, users, products]
  relationships: [
    relationship(orders.user_id > users.id, true),
    relationship(orders.product_id > products.id, true)
  ]
}
```

**Use when:** analyzing a single business process, query performance is a priority.

---

## Galaxy Schema (Fact Constellation)

Multiple fact tables share the same dimension tables.

```
users ←── orders ──→ products
users ←── returns ──→ products
```

```aml
Dataset galaxy_example {
  models: [orders, returns, users, products]
  relationships: [
    relationship(orders.user_id > users.id, true),
    relationship(orders.product_id > products.id, true),
    relationship(returns.user_id > users.id, true),
    relationship(returns.product_id > products.id, true)
  ]
  metric total_orders  { definition: @aql count(orders.id);; }
  metric total_returns { definition: @aql count(returns.id);; }
  metric return_rate   { definition: @aql safe_divide(total_returns * 100.0, total_orders);; }
}
```

**Use when:** reporting across multiple business processes that share dimension tables (orders + returns, orders + shipments, etc.).

---

## Snowflake Schema

Dimensions normalize into hierarchies. Example: `orders → users → cities → countries`.

```aml
Model cities {
  type: 'table'; table_name: 'geo.cities'; data_source_name: 'mydb'
  dimension id         { type: 'number'; primary_key: true }
  dimension name       { type: 'text' }
  dimension country_id { type: 'number' }
}
Model countries {
  type: 'table'; table_name: 'geo.countries'; data_source_name: 'mydb'
  dimension id   { type: 'number'; primary_key: true }
  dimension name { type: 'text' }
}

Dataset snowflake_example {
  models: [orders, users, cities, countries]
  relationships: [
    relationship(orders.user_id > users.id, true),
    relationship(users.city_id > cities.id, true),
    relationship(cities.country_id > countries.id, true)
  ]
}
```

Holistics auto-chains the JOINs: `orders → users → cities → countries`.

**Use when:** source data is already normalized, storage efficiency matters, or you need to express geographic/organizational hierarchies.

---

## Role-Playing Dimensions

Same dimension table used multiple times from a single fact table with different semantic meanings (e.g., `orders` has `created_date`, `shipped_date`, `delivered_date`, all pointing to the same `date_dim`).

**Problem:** Holistics can only have one active relationship between two models at a time. Auto-resolution fails when multiple FKs point to the same dimension.

**Solution:** Disable all relationships by default, use `with_relationships()` in each metric.

```aml
Dataset orders_timeline {
  models: [orders, date_dim]
  relationships: [
    relationship(orders.created_date_id > date_dim.id, false),   // inactive
    relationship(orders.shipped_date_id > date_dim.id, false),   // inactive
    relationship(orders.delivered_date_id > date_dim.id, false)  // inactive
  ]

  metric orders_by_created {
    label: 'Orders by Created Date'
    definition: @aql count(orders.id) | with_relationships(orders.created_date_id > date_dim.id);;
  }
  metric orders_by_shipped {
    label: 'Orders by Shipped Date'
    definition: @aql count(orders.id) | with_relationships(orders.shipped_date_id > date_dim.id);;
  }
  metric orders_by_delivered {
    label: 'Orders by Delivered Date'
    definition: @aql count(orders.id) | with_relationships(orders.delivered_date_id > date_dim.id);;
  }
}
```

**Alternative:** Create separate Query Models wrapping the same dimension table (`date_dim_created`, `date_dim_shipped`) to eliminate ambiguity structurally. Increases model count but removes `with_relationships()` complexity.

---

## Pattern selection guide

| Pattern | When to use |
|---------|-------------|
| **Star** | Single business process, simple queries, performance priority |
| **Galaxy** | Multiple fact tables that share dimension tables |
| **Snowflake** | Normalized source data, dimension hierarchies (geo, org) |
| **Role-playing** | Same dimension table referenced multiple ways from one fact |
