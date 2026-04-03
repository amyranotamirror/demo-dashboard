# AMQL: Complete Reference for Holistics Analytics Modeling & Query Language

**AMQL (Analytics Modeling and Querying Language)** is Holistics 4.0's complete analytics-as-code language, built around the principle that metrics—not tables—should be the atomic unit of analytics. It consists of two interconnected components: **AML** (Analytics Modeling Language), a declarative language for defining semantic models and business objects, and **AQL** (Analytics Querying Language), a metrics-centric query language that compiles to SQL. Together they replace ad-hoc SQL with reusable, composable, type-checked analytics logic that works across PostgreSQL, Redshift, BigQuery, Snowflake, Databricks, SQL Server, and ClickHouse.

---

## 1. Architecture and core philosophy

AMQL addresses two gaps in existing analytics tooling. First, no adequate declarative language existed for semantic models—XML, JSON, and YAML are too verbose or ambiguous, and LookML is proprietary. Second, SQL's rigid `SELECT…FROM…WHERE…GROUP BY` pattern lacks composability for metric-based analytics. AMQL solves both with a **declarative modeling layer** (AML) and a **pipe-based query language** (AQL) that treats metrics as first-class, reusable objects.

The data flow follows a clear pipeline: **Database Tables → Models** (`.model.aml`) **→ Datasets** (`.dataset.aml`) **→ Explore / Dashboards** (`.page.aml`). All code lives in a Git-backed development workspace with version control, branching, and code review. Changes deploy from Development to Production via a publish step.

### Design principles

- **Declarative over imperative**: Analysts specify *what* to model, not *how* to compute it
- **Metrics-centric thinking**: Queries revolve around pre-defined metrics and dimensions, not raw tables
- **Composability**: The pipe operator `|` lets queries break into small, chainable steps—unlike SQL's monolithic blocks
- **Static type checking**: A built-in type system catches errors in real time during development
- **Reusability**: Constants, functions, modules, and `extend` enable factoring out repeated logic across datasets and dashboards
- **Complement to SQL**: AQL compiles to SQL and is designed to cover SQL's gaps for metrics, not replace SQL entirely

---

## 2. AML — Analytics Modeling Language

AML is the declarative layer. Files use the extension `.<object-type>.aml`. The main object types are **Model**, **Dataset**, **Dashboard** (Page), **Relationship**, and **Schedule**.

### 2.1 Models

A **Model** is an abstract representation of a database table or derived query.

#### Table Model
Maps directly to a database table:

```aml
Model orders {
  type: 'table'
  label: "Orders"
  table_name: 'ecommerce.orders'
  data_source_name: 'demodb'
  description: "The orders model"

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
    // no definition → auto-maps to column 'created_at'
  }

  measure total_orders {
    label: 'Total Orders'
    type: 'number'
    definition: @sql count({{ #SOURCE.id }});;
    aggregation_type: 'custom'
  }
}
```

#### Query Model
Sits on top of a SQL `SELECT` and can join multiple models:

```aml
Model location {
  type: 'query'
  label: 'Location'
  data_source_name: 'demodb'
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

**Query Model SQL references:**

| Syntax | Meaning |
|---|---|
| `{{ #model_name }}` | Reference a model (required for dependency tracking) |
| `{{ #model_name as alias }}` | Alias a model reference |
| `{{ #alias.field_name }}` | Select a specific field (enables column pruning) |
| `{{ #model_name.* }}` | Select all fields of a model |

**Persistence** options for Query Models: `FullPersistence` (rebuild entire table) and `IncrementalPersistence` (append new records only), with scheduling via `schedules.aml`.

### 2.2 Dimensions

Dimensions are non-aggregated fields. They support types `'text'`, `'number'`, `'date'`, `'datetime'`, and `'truefalse'`.

**Key parameters:**

| Parameter | Description |
|---|---|
| `label` | Display name in exploration UI |
| `type` | Data type |
| `definition` | `@sql ...;;` or `@aql ...;;` expression |
| `primary_key` | Marks primary key (one per model; enables optimizations and AQL features) |
| `hidden` | `true` hides from exploration UI (not a security feature) |
| `description` | Semantic description |
| `format` | Display format string (e.g., `"#,###0.00"`) |

**Definition references in SQL:**
- `{{ #SOURCE.column }}` — underlying table column
- `{{ dimension_name }}` — another dimension in the same model
- If no `definition` is provided, the column name matching the dimension name is used automatically

```aml
// Derived dimension
dimension age_group {
  type: 'text'
  definition: @sql
    case
      when {{ age }} < 18 then 'Under 18'
      when {{ age }} >= 18 and {{ age }} < 31 then '18–30'
      else 'Over 30'
    end;;
}

// AQL-based dimension using dimensionalize
dimension customer_ltv {
  type: 'number'
  definition: @aql sum(orders.amount) | dimensionalize(users.id);;
}
```

**Dataset-level dimensions** combine fields from multiple models and require a `model` parameter:

```aml
Dataset ecommerce {
  dimension acquisition_cohort {
    model: users
    type: 'date'
    definition: @aql min(orders.created_at | month()) | dimensionalize(users.id);;
  }
}
```

### 2.3 Measures

Measures are aggregated fields defined inside models. They support types `'number'`, `'date'`, `'datetime'`.

**Two definition forms:**

```aml
// Form 1: Native aggregation_type
measure total_users {
  type: 'number'
  definition: @sql {{ user_id }};;
  aggregation_type: 'count'     // 'count'|'count distinct'|'sum'|'avg'|'max'|'min'|'median'|'stdev'|'custom'
}

// Form 2: Custom SQL aggregation
measure revenue {
  type: 'number'
  definition: @sql sum({{ #SOURCE.amount }});;
  aggregation_type: 'custom'
}

// Form 3: AQL-based measure
measure female_users {
  type: 'number'
  definition: @aql count(users.id) | where(users.gender == 'Female');;
}

// Composed measures referencing other measures
measure profit {
  type: 'number'
  definition: @sql {{ measure_revenue }} - {{ measure_cost }};;
  aggregation_type: 'custom'
}
```

**Critical rule:** Never define an aggregate function in both `aggregation_type` and `definition`. Use one approach or the other.

### 2.4 Datasets

A **Dataset** is a curated collection of models, their relationships, and derived metrics. It is the required context for data exploration and dashboard creation.

```aml
Dataset ecommerce {
  label: 'Ecommerce'
  data_source_name: 'demodb'
  models: [orders, order_items, users, products, categories]

  relationships: [
    relationship(orders.user_id > users.id, true),
    relationship(order_items.order_id > orders.id, true),
    relationship(order_items.product_id > products.id, true),
    relationship(products.category_id > categories.id, true)
  ]

  // Dataset-level dimension (cross-model, AQL only)
  dimension full_name {
    model: users
    type: 'text'
    definition: @aql concat(users.first_name, ' ', users.last_name);;
  }

  // Dataset-level metrics (more powerful than model measures)
  metric count_orders {
    label: 'Count Orders'
    type: 'number'
    definition: @aql count(orders.id);;
  }
  metric revenue {
    label: 'Revenue'
    type: 'number'
    definition: @aql sum(order_items, order_items.quantity * products.price);;
  }
  metric aov {
    label: 'AOV'
    type: 'number'
    definition: @aql safe_divide(revenue, count_orders);;
  }

  // View controls how fields appear in the exploration UI
  view {
    model orders { }
    model users { }
    group business_metrics {
      metric revenue
      metric aov
    }
  }
}
```

**Measure vs Metric:** A *measure* is defined in a model; a *metric* is defined at the dataset level. Metrics use AQL exclusively and can perform cross-model calculations and reference other metrics.

### 2.5 Relationships

Relationships define joins between models.

**Types:** `many_to_one` (operator `>`), `one_to_one` (operator `-`). Many-to-many requires a junction model.

```aml
// Short form (inside dataset)
relationship(orders.user_id > users.id, true)          // many-to-one, active
relationship(users.id - accounts.user_id, true)         // one-to-one, active
relationship(orders.user_id > users.id, true, 'one_way') // with filter direction

// Full form
RelationshipConfig {
  rel: Relationship {
    type: 'many_to_one'
    from: r(order_items.product_id)
    to: r(products.id)
  }
  active: true
  filter_direction: 'two_way'    // 'one_way' or 'two_way' (default)
}

// Named reusable relationship (separate file)
Relationship order_items_products {
  type: 'many_to_one'
  from: r(order_items.product_id)
  to: r(products.id)
}
// Referenced in dataset:
relationships: [ relationship(order_items_products, true) ]
```

**Role-playing dimensions:** Only one relationship between two models can be active. Use `with_relationships()` in metrics to override:

```aml
metric delivered_orders {
  definition: @aql
    count(fct_orders.id)
    | with_relationships(fct_orders.delivered_at > dim_dates.date);;
}
```

### 2.6 Dashboards

Dashboards are defined in `.page.aml` files with blocks, interactions, layout, and themes.

```aml
Dashboard ecommerce_dashboard {
  title: 'Ecommerce Overview'

  block v1: VizBlock {
    label: 'Revenue Over Time'
    viz: CombinationChart {
      dataset: ecommerce
      settings { row_limit: 5000; legend_label: 'top' }
    }
  }
  block f1: FilterBlock {
    label: 'Date Range'
    type: 'field'
    source: FieldFilterSource {
      dataset: ecommerce
      field: r(orders.created_at)
    }
    default { operator: 'matches'; value: 'last 2 years' }
  }
  block d1: DateDrillBlock { label: 'Drill by'; default: 'month' }
  block t1: TextBlock { content: @md # Key Metrics;; }

  interactions: [
    DateDrillInteraction {
      from: 'd1'
      to: [ CustomMapping { block: 'v1'; field: r(orders.created_at) } ]
    }
  ]

  settings { timezone: 'America/Los_Angeles'; cache_duration: 360 }

  view: CanvasLayout {
    label: 'Main View'; width: 1080; height: 620
    block t1 { position: pos(30, 30, 250, 60) }
    block v1 { position: pos(300, 30, 760, 300) }
    block f1 { position: pos(30, 100, 250, 80) }
    block d1 { position: pos(30, 190, 250, 80) }
  }
}
```

**Block types:** `VizBlock` (charts), `TextBlock` (markdown), `FilterBlock` (field/date filters), `DateDrillBlock` (granularity selector).

**Chart types available:** DataTable, PivotTable, PieChart, BarChart, ColumnChart, LineChart, AreaChart, CombinationChart, ScatterChart, BubbleChart, MetricSheet, GaugeChart, GeoMap, PointMap, Heatmap, FilledMap, Histogram, WaterfallChart, BoxPlot, CandlestickChart, FunnelChart, PyramidChart, RadarChart, WordCloud, CohortRetention, ConversionFunnel, CustomCharts.

### 2.7 Reusability features

| Feature | Purpose |
|---|---|
| **Constant** (`const`) | Named reusable values (SQL snippets, config values, themes) |
| **Function** (`Func`) | Parameterized reusable blocks (charts, configs). Last expression returned. Cannot return models/datasets. |
| **Module** | Directory of related AML objects under `modules/`, imported with `use` statement |
| **Extend** (`.extend({})`) | Creates new objects inheriting all properties of the original; used for role-playing, metric stores, templated dashboards |
| **String Interpolation** (`${var}`) | Embed variable values in strings |
| **If-else** | Conditional logic in AML definitions |
| **Block Library** (`@template`) | Reusable, parameterized dashboard blocks stored in `library/blocks/` |

```aml
// Function example
Func order_pie(country: String) {
  VizBlock {
    label: '# of Orders in ${country}'
    viz: PieChart {
      filter { field: r(countries.name); operator: 'is'; value: '${country}' }
    }
  }
}

// Usage
block v9: order_pie('Vietnam')
block v10: order_pie('Germany')
```

---

## 3. AQL — Analytics Querying Language

AQL is the query component of AMQL. It operates within a dataset context (requires models + relationships), compiles to SQL, and treats metrics as first-class, composable objects.

### 3.1 The pipe operator

The pipe `|` is AQL's core syntactic construct. The expression before the pipe becomes the first argument to the function after it:

```
expression | function(arg2, arg3)
// is equivalent to:
function(expression, arg2, arg3)
```

This enables readable, left-to-right data pipelines:

```aql
orders
| filter(orders.status == 'delivered')
| group(orders.created_at | month())
| select(orders.created_at | month(), sum(orders.amount))
```

### 3.2 Two expression types

**Table Expressions** return tables (analogous to SQL queries):

```aql
users                                          // all rows
users | select(users.id, users.name)           // column projection
users | filter(users.age > 30)                 // row filtering
users | group(users.gender) | select(users.gender, count(users.id))  // aggregation
```

**Metric Expressions** represent reusable aggregation logic:

```aql
count(orders.id)                               // simple metric
sum(order_items, order_items.quantity * products.price)  // cross-model
revenue | where(orders.status == 'delivered')  // filtered metric
revenue | of_all(products)                     // LoD-modified metric
```

Key distinction: Table expressions flow data through transformations. Metric expressions define reusable business calculations that automatically adapt to whatever dimensions, filters, and time periods users apply at explore time.

### 3.3 AQL in AML definitions

AQL is embedded using `@aql ... ;;` syntax:

```aml
dimension full_name {
  type: 'text'
  definition: @aql concat(users.first_name, ' ', users.last_name);;
}

measure order_count {
  type: 'number'
  definition: @aql count(orders.id);;
}

metric revenue {
  label: 'Revenue'
  type: 'number'
  definition: @aql sum(order_items, order_items.quantity * products.price);;
}
```

### 3.4 Complete operator reference

#### Arithmetic operators

| Operator | Description |
|---|---|
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `//` | Integer division |

String concatenation with `+` is NOT supported—use `concat()`.

#### Comparison operators

**Text:**

| Operator | Example |
|---|---|
| `==` / `is` | `products.name == 'Dandelion'` |
| `!=` / `is not` | `products.name != 'Rock'` |
| `like` | `products.name like '%Dan'` |
| `not like` | `products.name not like '%Dan'` |
| `ilike` | `products.name ilike '%dan'` (case-insensitive) |
| `not ilike` | `products.name not ilike '%dan'` |
| `is null` / `is not null` | `products.name is null` |
| `in` / `not in` | `products.name in ['Dandelion', 'Rock']` |

**Number:**

| Operator | Example |
|---|---|
| `==` / `is` | `order_items.discount == 0.5` |
| `!=` / `is not` | `order_items.discount != 1` |
| `>`, `<`, `>=`, `<=` | `order_items.discount > 0.5` |
| `is null` / `is not null` | `order_items.discount is null` |

**Datetime** (right-hand side always starts with `@`):

| Operator | Example | Behavior |
|---|---|---|
| `==` | `orders.created_at == @2022` | Exact timestamp match (2022-01-01 00:00:00) |
| `is` / `matches` | `orders.created_at is @2022` | Within entire period (full year 2022) |
| `!=` | `orders.created_at != @2022-01` | Not exact timestamp |
| `is not` | `orders.created_at is not @2022-01` | Not within period |
| `<`, `>`, `>=`, `<=` | `orders.created_at > @(yesterday)` | Before/after period |
| `is null` / `is not null` | `orders.created_at is null` | Null check |

**Critical distinction:** `==` matches an exact timestamp; `is`/`matches` matches an entire time *period*.

**Boolean:** `is`, `is not`, `is null`, `is not null` (e.g., `orders.is_paid is true`)

**Logical combinators:** `and`, `or`

### 3.5 Datetime literals

All datetime values start with the `@` token:

```aql
// Fixed dates
@2023                          // year
@2023-04                       // month
@2023-04-01                    // day
@2023-04-01 10:30:00           // full timestamp

// Fixed ranges
@2023-04-01 - 2023-04-30

// Relative datetimes
@now  @today  @yesterday
@(last 7 days)  @(last 3 months)  @(this year)
```

---

## 4. AQL functions — complete reference

### 4.1 Aggregation functions

All take an optional `table` parameter (auto-inferred from the expression when omitted) and an `expression` to aggregate.

| Function | Params | Returns | Notes |
|---|---|---|---|
| `count(expr)` | Any | Number | Count of non-NULL values |
| `count_if(condition)` | Truefalse | Number | Count rows satisfying condition |
| `count_distinct(expr)` | Any | Number | Distinct non-NULL count |
| `approx_count_distinct(expr)` | Any | Number | HyperLogLog estimate (~2-3% error). Alias: `approx_countd()`. Snowflake, BigQuery, Databricks only |
| `sum(expr)` | Number | Number | Sum |
| `average(expr)` / `avg()` | Number | Number | Average |
| `min(expr)` | Any | Any | Minimum |
| `max(expr)` | Any | Any | Maximum |
| `median(expr)` | Number | Number | Median |
| `stdev(expr)` | Number | Number | Sample standard deviation |
| `stdevp(expr)` | Number | Number | Population standard deviation |
| `var(expr)` | Number | Number | Sample variance |
| `varp(expr)` | Number | Number | Population variance |
| `percentile_cont(expr, pct)` | Any, Number(0-1) | Any | Interpolated percentile |
| `percentile_disc(expr, pct)` | Any, Number(0-1) | Any | Discrete percentile |
| `string_agg(expr, sep:, distinct:, order:)` | Text | Text | Concatenate group values |
| `corr(table, field1, field2)` | Table, Number, Number | Number | Pearson correlation |
| `max_by(table, value, by)` | Table, Any, Any | Any | Value where `by` is maximum |
| `min_by(table, value, by)` | Table, Any, Any | Any | Value where `by` is minimum |

**Source table inference:** When all fields come from one model, AQL infers the source table. When fields come from multiple models, specify the base table explicitly as the first argument:

```aql
sum(orders.amount)                                    // auto-inferred: orders
sum(order_items, order_items.quantity * products.price) // explicit: order_items
```

### 4.2 Table functions

| Function | Signature | Description |
|---|---|---|
| `select` | `table \| select(field1, alias: expr, ...)` | Select/create fields; define named expressions with `name: expression` |
| `filter` | `table \| filter(condition)` | Filter rows locally (post-retrieval). Differs from `where` |
| `group` | `table \| group(dim1, dim2, ...)` | Group by dimensions (subsequent `select` must match grouping) |
| `unique` | `unique(dim1, dim2, ...)` | All unique combinations; recommended over `group` for nested aggregation |

### 4.3 Metric/condition functions

**`where(condition1, condition2, ...)`** — Pushes conditions to the source model before calculations (like a dashboard filter). Only supports pre-defined dimensions in conditions.

```aql
revenue | where(orders.status == 'delivered')
revenue | where(orders.created_at matches @(last 30 days))
```

**`of_all(model, dimension, ...)`** — Aliases: `exclude_grains()`, `exclude()`. Removes specified dimensions from the calculation context (Level of Detail). Core function for percent-of-total calculations.

```aql
revenue | of_all(products)          // revenue ignoring product dimension
revenue | of_all(products.name)     // revenue ignoring product name specifically
```

Optional parameter `keep_filters: true/false` (default false) controls whether filters on excluded dimensions are preserved.

**`keep_grains(model, dimension, ...)`** — Alias: `keep()`. Calculates metric only against specified dimensions, ignoring all others.

```aql
sum(order_items.order_value) | keep_grains(users)
```

**`dimensionalize(dimension, ...)`** — Converts aggregated metric into a dimension. **Only allowed in dimension definitions.** Use once per dimension, at the top level.

```aql
// In a dimension definition
sum(orders.amount) | dimensionalize(users.id)    // customer LTV as a dimension
min(orders.created_at | month()) | dimensionalize(users.id)  // acquisition cohort
```

**`percent_of_total(metric, total_type)`** — Calculates percentage. `total_type`: `'row_total'`/`'x_axis_total'`, `'column_total'`/`'legend_total'`, `'grand_total'`.

**`with_relationships(relationship)`** — Overrides which relationship to use for a metric (role-playing dimensions).

**`is_at_level(dimension)`** — Returns true if the current LoD context includes the specified dimension. Used for conditional measure behavior in pivot tables.

### 4.4 Time-based metric functions

| Function | Syntax | Description |
|---|---|---|
| `running_total` | `metric \| running_total(date_dim)` | Cumulative sum along a dimension |
| `relative_period` | `metric \| relative_period(date_dim, interval(-1 month))` | Shift metric to a different time period. Accepts `interval()` or integer offset |
| `exact_period` | `metric \| exact_period(date_dim, @2022-12-01 - 2023-01-01)` | Fixed time window, overriding filters |
| `period_to_date` | `metric \| period_to_date('year', date_dim)` | YTD/QTD/MTD accumulation. Parts: `'year'`, `'quarter'`, `'month'`, `'week'`, `'day'` |
| `trailing_period` | `metric \| trailing_period(date_dim, interval(3 months))` | Rolling window (e.g., trailing 3 months) |

### 4.5 Time intelligence (scalar) functions

**Truncation** — truncate to granularity (returns Date/Datetime):

```aql
date_trunc(orders.created_at, 'month')   // or shorthand:
orders.created_at | month()              // also: day(), week(), quarter(), year(), hour(), minute()
```

**Extraction** — extract numeric part (returns Number):

```aql
date_part('month', orders.created_at)    // or shorthand:
orders.created_at | month_num()          // also: year_num(), quarter_num(), week_num(), day_num(),
                                         //        dayofweek_num()/dow_num(), hour_num(), minute_num(), second_num()
```

**Other time functions:**

| Function | Returns | Example |
|---|---|---|
| `date_diff(part, start, end)` | Number | `date_diff('day', orders.created_at, @now)` |
| `date_format(dt, pattern)` | Text | `date_format(orders.created_at, '%Y-%m-%d')` |
| `epoch(dt)` | Number | Unix timestamp |
| `from_unixtime(n)` | Datetime | Convert Unix timestamp |
| `last_day(dt, part)` | Date | Last day of month/quarter/year/week |

**Format patterns:** `%Y` (4-digit year), `%y` (2-digit), `%m` (month 01-12), `%B` (full month name), `%b` (abbreviated), `%d` (day), `%A` (full weekday), `%a` (abbreviated), `%H` (24h hour), `%I` (12h), `%M` (minutes), `%S` (seconds), `%p` (AM/PM), `%q` (quarter).

### 4.6 Window functions

All window functions share common parameters:
- **`order`** (required for most): field with optional `asc()`/`desc()`, or axis reference `'rows'`/`'x_axis'`, `'columns'`/`'legend'`
- **`partition`** / **`reset`** (optional): field for partitioning
- **`range`** (optional): row range like `-2..0` (2 before to current), `..0` (start to current), `0..` (current to end), `..` (all)

**Navigation functions:**

| Function | Description |
|---|---|
| `previous(expr, [offset], order:, [partition:])` | Value from N rows back (default 1) |
| `next(expr, [offset], order:, [partition:])` | Value from N rows forward |
| `first_value(expr, order:, [partition:])` | First row in frame |
| `last_value(expr, order:, [partition:])` | Last row in frame |
| `nth_value(expr, n, order:, [partition:])` | Nth row in frame |

**Ranking functions:**

| Function | Description |
|---|---|
| `rank(order:, [partition:])` | Skip-rank (1,1,3,4,4,6) |
| `dense_rank(order:, [partition:])` | Dense rank (1,1,2,3,3,4) |
| `ntile(n, order:, [partition:])` | Divide into N buckets |
| `percent_rank(order:, [partition:])` | Relative percentile (0 to 1) |

**Window aggregate functions** (accept aggregate metrics, default range `..0` with order, `..` without):

`window_sum`, `window_avg`, `window_min`, `window_max`, `window_count`, `window_stdev`, `window_stdevp`, `window_var`, `window_varp`

```aql
window_avg(count(orders.id), -2..0, order: orders.created_at, partition: orders.status)
```

### 4.7 Logical, math, text, and null-handling functions

**Logical:**

```aql
case(
  when: users.age < 18, then: 'Minor',
  when: users.age < 65, then: 'Adult',
  else: 'Senior'
)
```

`and()`, `or()`, `not()` functions are available but operators are preferred in modern AQL.

**Math functions:** `abs`, `sqrt`, `ceil`, `floor`, `round(n, scale)`, `trunc(n, scale)`, `exp`, `ln`, `log10`, `log2`, `pow`, `mod`, `div`, `sign`, `pi()`, `radians`, `degrees`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `cot`.

**Text functions:** `concat`, `find`, `left`, `right`, `mid`, `len`, `lpad`, `rpad`, `lower`, `upper`, `trim`, `ltrim`, `rtrim`, `replace`, `split_part`, `regexp_extract`, `regexp_like`, `regexp_replace`.

**Null/Zero handling:**

| Function | Description |
|---|---|
| `coalesce(v1, v2, ...)` | First non-null value |
| `nullif(e1, e2)` | NULL if e1 equals e2 |
| `safe_divide(a, b)` | NULL instead of division-by-zero error |

**Important:** Unlike SQL, AQL returns `null` (not 0) when no data matches a filter. Use `coalesce()` for defaults.

**SQL passthrough functions** (call native database functions):
- Scalar: `sql_text()`, `sql_number()`, `sql_datetime()`, `sql_date()`, `sql_truefalse()`
- Aggregate: `agg_text()`, `agg_number()`, `agg_datetime()`, `agg_date()`, `agg_truefalse()`

**AI functions** (Databricks and Snowflake only): `ai_complete(model, prompt)`, `ai_similarity(text1, text2)`, `ai_classify(text, ...categories)`, `ai_summarize(content)`.

**Other:** `cast(value, type)` — type conversion.

---

## 5. Advanced AQL patterns

### 5.1 Level of Detail (LoD)

LoD controls the granularity at which a metric is calculated, independent of the visualization dimensions.

**Lower LoD than visualization** — use `of_all()`:

```aql
// Percent of total: each country's share of all orders
metric pct_of_total {
  definition: @aql
    safe_divide(count(orders.id) * 100.0, count(orders.id) | of_all(countries));;
}
```

**Higher LoD than visualization** — use nested aggregation:

```aql
// Average monthly signups (inner: count per month; outer: average)
metric avg_monthly_signups {
  definition: @aql
    users
    | group(users.created_at | month())
    | select(monthly_count: count(users.id))
    | avg(monthly_count);;
}
```

The `unique()` function is recommended over `group()` for nested aggregation as it's shorter.

**Fixed LoD** — use `dimensionalize()`:

```aql
// Customer AOV as a dimension (always calculated per user)
dimension aov_dim {
  model: users
  definition: @aql
    sum(order_items, order_items.quantity * products.price) * 1.0
    / count_distinct(orders.id) | dimensionalize(users.id);;
}
```

### 5.2 Percent of total

```aql
metric percent_of_total {
  definition: @aql
    (sum(order_items.amount) * 1.0) / (sum(order_items.amount) | of_all(order_items));;
}

// Per-category percent
metric percent_of_category {
  definition: @aql
    safe_divide(revenue * 100.0, revenue | of_all(products.name));;
}
```

### 5.3 Cohort retention analysis

```aml
// Step 1: Acquisition cohort
dimension acquisition_cohort {
  model: users; type: 'date'
  definition: @aql min(orders.created_at | month()) | dimensionalize(users.id);;
}

// Step 2: Month number since acquisition
dimension month_no {
  model: orders; type: 'number'
  definition: @aql date_diff('month', acquisition_cohort, orders.created_at | month());;
}

// Step 3: Retention rate
metric retention {
  definition: @aql (count(users.id) * 1.0) / (count(users.id) | of_all(orders.month_no));;
}
```

### 5.4 Period-over-period comparison

```aml
metric revenue {
  definition: @aql sum(orders.amount);;
}
metric revenue_last_month {
  definition: @aql revenue | relative_period(orders.created_at, interval(-1 month));;
}
metric revenue_growth {
  definition: @aql safe_divide((revenue - revenue_last_month) * 100.0, revenue_last_month);;
}

// YTD
metric ytd_revenue {
  definition: @aql revenue | period_to_date('year', orders.created_at);;
}

// Running total
metric cumulative_revenue {
  definition: @aql running_total(revenue, orders.created_at | month());;
}
```

### 5.5 Composed metrics

Metrics can build on other metrics, creating a composable library:

```aql
metric total_revenue {
  definition: @aql sum(order_items, order_items.quantity * products.price);;
}
metric total_orders {
  definition: @aql count(orders.id);;
}
metric revenue_per_order {
  definition: @aql safe_divide(total_revenue, total_orders);;
}
metric delivered_revenue {
  definition: @aql total_revenue | where(orders.status == 'delivered');;
}
```

---

## 6. Order of operations

Holistics executes operations in this strict sequence:

1. **Create model CTEs** (Common Table Expressions)
2. **Apply query params** (for Query Models)
3. **Execute AQL dimensions**
4. **Ignore excluded dimensions from filters** — if `of_all()` excludes a dimension, filters on it are also ignored
5. **Apply filters on non-excluded dimensions** (before aggregation)
6. **Execute aggregation/metric logic**
7. **Apply filters on measures/metrics** (after aggregation, on the final result)

Dimension filters and metric filters execute at different times even though they appear in the same UI. This is critical for understanding LoD behavior.

---

## 7. How AQL differs from SQL

| SQL Concept | AQL Equivalent |
|---|---|
| `SELECT … FROM` | `model \| select(...)` |
| `FROM table` | Source table auto-inferred or explicit first argument |
| `JOIN ON` | Relationships defined once in dataset; auto-joined |
| `WHERE` | `filter()` (table-level) or `where()` (metric-level) |
| `GROUP BY` | `group()` function, or dynamic at explore time |
| `CASE WHEN…THEN…ELSE…END` | `case(when:, then:, else:)` |
| `SUM(CASE WHEN…)` | `metric \| where(condition)` |
| `CTEs / WITH` | Composed metrics and pipe chains |
| `Subqueries` | `group() \| select() \| aggregate()` nesting |
| `LAG()` | `previous()` or `relative_period()` |
| `Window functions` | `rank()`, `window_sum()`, `running_total()`, etc. |

**Paradigm shifts:** SQL is table-centric; AQL is metrics-centric. SQL requires explicit JOINs; AQL auto-joins via semantic relationships. SQL `GROUP BY` is query-specific; AQL grouping is dynamic (chosen at explore time). AQL metrics are reusable building blocks; SQL aggregations are locked to individual queries.

---

## 8. Best practices and rules

**Model setup:**
- Always define `primary_key: true` on the unique identifier dimension—enables query optimization and AQL features
- Dimension types must match underlying data types (no automatic casting)

**Metric design:**
- Avoid using dimensions without aggregation in metrics—creates fragile metrics requiring specific explore context
- Only introduce `group()` when absolutely necessary (for nested aggregation); metrics auto-slice by explore dimensions
- Specify the source table explicitly when aggregating across multiple models: `sum(order_items, order_items.quantity * products.price)`
- Always follow `group()` with `select()` or `filter()`

**Relationships:**
- Must match actual data cardinality
- The "one" side must have unique values (otherwise fan-out errors occur)
- Avoid circular or ambiguous relationship paths

**Data quality:**
- Use `safe_divide()` to prevent division by zero
- Use `coalesce()` to provide default values when no data matches
- Use `where()` over `filter()` in metric definitions for better reusability
- `dimensionalize()` should appear only once per dimension and at the top level

**Performance:**
- Use PreAggregates for frequently accessed metrics
- Use `approx_count_distinct()` instead of `count_distinct()` for large datasets where ~2-3% error is acceptable

---

## 9. Error handling and known limitations

**Common errors:**
- **ERR-101**: Referenced model/field/metric doesn't exist in scope
- **ERR-102**: Unsupported operator for data type (e.g., `+` for text—use `concat()`)
- **ERR-205**: Named expression expects field/scalar, found unknown
- **WARN-300**: `group()` without subsequent `select()` or `filter()`

**Limits:**
- Maximum **100 columns** in visualization legends/pivot columns
- Maximum **1,000,000 rows** for exploration; **100,000** for modeling preview
- AML Functions cannot return models or datasets (use `extend` instead)
- Once `extend`/`const`/`func` is used in dashboards, charts/layouts must be defined in code—UI editing won't work
- Personal Canvas dashboards are only viewable/editable in Reporting, not Development
- `dimensionalize()` cannot be nested or used more than once per dimension

**Behavioral notes:**
- AQL returns `null` (not `0`) when no data matches a filter
- Window functions in dimensions operate on the full underlying table before any filters are applied
- Non-additive metrics (COUNT DISTINCT, AVERAGE, MEDIAN) cannot be re-aggregated from pre-aggregated data—Holistics handles this via just-in-time SQL generation from raw data

---

## 10. Quick-start example: end-to-end

```aml
// ===== orders.model.aml =====
Model orders {
  type: 'table'
  table_name: 'ecommerce.orders'
  data_source_name: 'demodb'

  dimension id       { type: 'number'; primary_key: true }
  dimension user_id  { type: 'number' }
  dimension status   { type: 'text' }
  dimension created_at { type: 'datetime' }
  dimension amount   { type: 'number' }

  measure order_count {
    type: 'number'
    definition: @aql count(orders.id);;
  }
  measure total_revenue {
    type: 'number'
    definition: @aql sum(orders.amount);;
  }
}

// ===== users.model.aml =====
Model users {
  type: 'table'
  table_name: 'ecommerce.users'
  data_source_name: 'demodb'

  dimension id         { type: 'number'; primary_key: true }
  dimension name       { type: 'text' }
  dimension created_at { type: 'datetime' }
  dimension country    { type: 'text' }
}

// ===== ecommerce.dataset.aml =====
Dataset ecommerce {
  label: 'Ecommerce'
  data_source_name: 'demodb'
  models: [orders, users]
  relationships: [
    relationship(orders.user_id > users.id, true)
  ]

  // Cross-model dimension
  dimension acquisition_cohort {
    model: users
    type: 'date'
    definition: @aql min(orders.created_at | month()) | dimensionalize(users.id);;
  }

  // Dataset metrics
  metric revenue {
    label: 'Revenue'
    type: 'number'
    definition: @aql sum(orders.amount);;
  }
  metric revenue_last_month {
    label: 'Revenue (Prev Month)'
    type: 'number'
    definition: @aql revenue | relative_period(orders.created_at, interval(-1 month));;
  }
  metric revenue_growth {
    label: 'MoM Growth %'
    type: 'number'
    definition: @aql safe_divide((revenue - revenue_last_month) * 100.0, revenue_last_month);;
  }
  metric pct_of_total_by_country {
    label: '% of Total Revenue'
    type: 'number'
    definition: @aql safe_divide(revenue * 100.0, revenue | of_all(users.country));;
  }
}

// ===== dashboard.page.aml =====
Dashboard revenue_overview {
  title: 'Revenue Overview'

  block v1: VizBlock {
    label: 'Monthly Revenue Trend'
    viz: LineChart { dataset: ecommerce }
  }
  block v2: VizBlock {
    label: 'Revenue by Country'
    viz: BarChart { dataset: ecommerce }
  }
  block f1: FilterBlock {
    label: 'Date Range'
    type: 'field'
    source: FieldFilterSource { dataset: ecommerce; field: r(orders.created_at) }
    default { operator: 'matches'; value: 'last 12 months' }
  }

  view: CanvasLayout {
    label: 'Main'; width: 1080; height: 500
    block v1 { position: pos(20, 20, 520, 460) }
    block v2 { position: pos(560, 20, 500, 460) }
    block f1 { position: pos(20, 0, 200, 20) }
  }
}
```

This end-to-end example demonstrates the full AMQL pipeline: table models with dimensions and measures, a dataset with relationships and AQL-powered metrics (including period comparison, growth rate, and percent-of-total), and a canvas dashboard with chart blocks and filters—all defined as code, version-controlled, and ready to deploy.