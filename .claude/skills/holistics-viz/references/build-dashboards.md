# Holistics Dashboard Assembly Reference

This reference covers how to build, structure, and configure dashboards in Holistics 4.0 using AML — including architecture, layout, filters, interactions, reusability patterns, settings, and best practices.

---

## 1. Architecture and Core Concepts

### How Holistics visualizations work

Holistics follows a semantic-layer approach: data teams define **Models** (database tables with business logic), group them into **Datasets** (curated collections with relationships), then build **Dashboards** composed of modular **Blocks**. When a user views a report, Holistics constructs SQL queries sent to the data warehouse, waits for results, and renders visualizations. All dashboard definitions live in `.page.aml` files.

### Key terminology

| Concept | Description |
|---------|-------------|
| **AML** | Analytics Modeling Language — declarative language for defining models, datasets, dashboards |
| **AQL** | Analytical Querying Language — metrics-based query language leveraging the semantic model |
| **Dataset** | Collection of related models with relationships; required for exploration and charts |
| **VizBlock** | Visualization block — a chart, table, or KPI component on a dashboard |
| **FilterBlock** | Filter control block for interactivity |
| **DateDrillBlock** | Control to change time granularity |
| **CanvasLayout** | Single free-form page layout (default) |
| **TabLayout** | Multi-tab dashboard layout |
| **PageTheme** | Four-level theme hierarchy for styling |

### Dashboard AML structure (5 components)

```aml
Dashboard myDashboard {
  title: 'My Dashboard'
  description: ''''''

  // BLOCKS
  block t1: TextBlock { content: @md # Hello World!;; }
  block v1: VizBlock { label: 'Revenue' viz: ColumnChart { dataset: demo ... } }
  block f1: FilterBlock { label: 'Date' type: 'field' source: FieldFilterSource { dataset: demo field: r(orders.created_at) } default { operator: 'matches' value: 'last 2 years' } }
  block d1: DateDrillBlock { label: 'Drill by' default: 'month' }

  // INTERACTIONS
  interactions: [
    DateDrillInteraction {
      from: 'd1'
      to: [ CustomMapping { block: 'v1' field: r(orders.created_at) } ]
    }
  ]

  // SETTINGS
  settings {
    timezone: 'America/Los_Angeles'
    cache_duration: 360
    autorun: true
  }

  // VIEW
  view: CanvasLayout {
    label: 'View 1'
    width: 1080
    height: 620
    block v1 { position: pos(300, 30, 760, 250) }
    block f1 { position: pos(30, 190, 250, 80) }
    block d1 { position: pos(30, 100, 250, 80) }
  }
}
```

---

## 2. Canvas Dashboard Blocks and Layout

### Block types

| Block | AML Type | Purpose |
|-------|----------|---------|
| Visualization | `VizBlock` | Charts, tables, KPIs |
| Text | `TextBlock` | Markdown, HTML, images, videos, Mermaid diagrams |
| Filter | `FilterBlock` | Field/manual filter controls |
| Date Drill | `DateDrillBlock` | Time granularity control |
| Reused Block | `dashboard.block.name` | Reference blocks from other dashboards |

### TextBlock

```aml
block t1: TextBlock {
  content: @md
    # Heading
    ## Subheading
    * Bullet points
    **Bold text**
    ![Image](https://url.com/image.png)
    <iframe width="600" height="400" src="https://www.youtube.com/embed/ID"></iframe>
  ;;
}
```

Supports: Markdown, HTML/CSS, images, YouTube embeds, Mermaid diagrams, table of contents via `[Section](#block-v1)` links, iframes for Google Slides/Forms/FigJam.

### Layout positioning

**CanvasLayout** (single page):
```aml
view: CanvasLayout {
  label: 'View 1'
  width: 1560        // pixels
  height: 1080       // pixels
  margin: 10         // optional
  grid_size: 20      // optional snap grid

  block v1 {
    position: pos(x, y, width, height)  // all in pixels
    layer: 7                             // z-index (optional)
  }
}
```

**TabLayout** (multi-tab):
```aml
view: TabLayout {
  label: 'View 1'
  tab tab1: CanvasLayout {
    label: 'Products'
    height: 1100
    block v1 { position: pos(900, 120, 300, 100) }
    mobile { mode: 'manual' block v1 block v2 }
  }
  tab tab2: CanvasLayout {
    label: 'Sales'
    height: 1100
  }
}
```

**Tab features**: On-demand loading, smart caching, sync blocks (synchronized across tabs), cross-tab interactions (manually enabled). Recommended: under 10 tabs, <=100 blocks total.

### Auto-arrange with functions

```aml
const block_width = 220
const block_height = 200
const gap = 10

Func get_pos(index: Number) {
  pos(index * (block_width + gap), 0, block_width, block_height)
}

view: CanvasLayout {
  width: 1200
  height: 800
  block v1 { position: get_pos(0) }
  block v2 { position: get_pos(1) }
  block v3 { position: get_pos(2) }
}
```

### Block preferences

Available per block: custom title, description, hide block's action menu (hides Explore, Data Alerts, Expand in View Mode).

### Layout assist features

Snap to grid, smart trimming, smart shifting, auto-expand canvas, zoom controls (fit-to-width, fit-to-page, custom percentage).

---

## 3. Filters, Interactions, and Controls

### FilterBlock (field filter)

```aml
block f1: FilterBlock {
  label: 'Order Created At'
  type: 'field'
  source: FieldFilterSource {
    dataset: demo_ecommerce
    field: r(order_master.order_created_at)
  }
  default {
    operator: 'matches'
    value: 'last 2 years'
  }
}
```

### Filter types and operators

| Field Type | Operators |
|-----------|-----------|
| **Text** | `is`, `is not`, `contains`, `does not contain`, `starts with`, `ends with`, `is null`, `is not null` |
| **Number** | `equal`, `not equal`, `less than`, `greater than`, `between`, `is null`, `is not null` |
| **Date** | `matches` (e.g., 'last 2 years'), `is`, `is in range`, `is before`, `is after` |
| **True/False** | All boolean operators |

**Multi-select**: Text (`is`/`is not`) and Number (`equal`/`not equal`) support multiple values. Mass input supports up to **2,000 values**.

**Filter mapping**: Field filters auto-map to VizBlocks from the same dataset in the same tab. Manual filters must be explicitly mapped. Dashboard filter + block filter = combined with AND.

**Parent-child filters**: Parent filter limits suggested values in child filter. Requires model relationships between parent/child fields.

**URL parameters**: `dashboard_url?<block_uname><operator><value>`. Filter state persisted in `_fstate` URL parameter.

### DateDrillBlock

```aml
block d1: DateDrillBlock {
  label: 'Drill by'
  default: 'month'    // year|quarter|month|week|day|hour|minute
}

interactions: [
  DateDrillInteraction {
    from: 'd1'
    to: [
      CustomMapping {
        block: 'v1'
        field: r(order_master.order_created_at)
      }
    ]
  }
]
```

Each report maps to only **one** Dashboard Date Drill at a time. Dashboard Date Drill persists in exports; widget-level is temporary.

### Period-over-Period comparison

**Three setup methods**:
1. **Per-visualization**: Click measure > "Add calculation: Period-over-period comparison"
2. **Dashboard control**: Add "Period Comparison" control block
3. **AQL expression**: `relative_period()` function

```aml
metric revenue_last_year {
  definition: @aql
    sum(orders.amount) | relative_period(orders.created_at, interval(-12 month))
  ;;
}
```

**Two types**: Previous Period (relative shift) and Custom Period (absolute timeframe).

### Cross-filtering

**Enabled by default** for Canvas dashboards. Click any data point > all dimension values become filters across the dashboard. Uses all dimensions from clicked record; applies to widgets from same dataset or models with relationships.

**Disable per-block**: Block Preferences > Cross-filtering > toggle off.

**Supported on**: Table, Pivot Table, Line/Bar/Column/Area/Combination, Pie/Funnel/Pyramid, Scatter/Bubble, Custom Charts (with signal setup).

### Drill-through

Navigate from source to target dashboard, passing clicked data values as filter parameters. Target dashboard must have Field Filters with **drill-through enabled**. Auto or Custom mode for controlling which dashboards link.

### Drill Down and Break Down

**Zero configuration required** — work immediately. Right-click any data point > Break Down by any dimension, or Drill Down through hierarchy.

**AML customization (dataset level)**:
```aml
Dataset ecommerce {
  context {
    analysis {
      breakdown {
        group location {
          label: 'Locations'
          fields: [ r(users.continent), r(users.country), r(users.city) ]
        }
        group product {
          label: 'Products'
          fields: [ r(products.category), r(products.name) ]
        }
      }
    }
  }
}
```

**Disable**: `settings { analysis_interactions { breakdown { enabled: false } } }`

### Block-level inline filters

```aml
viz: PieChart {
  filter {
    field: r(ecommerce_countries.name)
    operator: 'is'
    value: 'Vietnam'
  }
  filter {
    field: r(orders.created_at)
    operator: 'last'
    value: 12
    modifier: 'month'
  }
}
```

Block filters combine with dashboard filters via AND — dashboard filters do NOT override block filters.

### Dashboard Actions

Row-level actions in Data Tables — currently supports **"Go To URL"** with dynamic URLs:

```aml
Model ticket {
  dimension zendesk_url {
    type: 'text'
    definition: @aql concat('https://org.zendesk.com/tickets/', ticket.id);;
  }
}
```

---

## 4. AML Reusability Patterns

### Constants

```aml
const total_orders = r(ecommerce_orders.total_orders_count)
const default_row_limit = 5000
```

### Functions (parameterized blocks)

```aml
Func get_order_pie(metric: FieldRef, country: String) {
  VizBlock {
    label: '# of Orders in ${country}'
    viz: PieChart {
      series { field { ref: metric } }
      filter { field: r(countries.name) operator: 'is' value: '${country}' }
    }
  }
}

Dashboard demo {
  block v1: get_order_pie(total_orders, 'Vietnam')
  block v2: get_order_pie(total_orders, 'Germany')
}
```

**Parameter types**: `String`, `Number`, `Boolean`, `FieldRef`, `VizFieldRef`, `Dataset`.

### Extend (dashboard inheritance)

```aml
Dashboard client_dash = master_template.extend({
  block v1: VizBlock { viz: BarChart { dataset: client_dataset } }
})
```

### Block references across dashboards

```aml
Dashboard another_dash {
  block v1: my_dashboard.block.v1
  block f1: my_dashboard.block.f1.extend({ label: "Different Label" })
}
```

### Reusable Block Library (`@template` decorator)

```aml
@template(
  title = "MRR & PoP Growth",
  description = "Revenue evolution over time",
  thumbnail = "https://link.to/image.png",
  metadata = {
    group: 'SaaS Metrics',
    block_width: 620,
    block_height: 460,
    func: TemplateFuncMetadata {
      param dataset: GeneralParamMetadata { description: 'Revenue dataset' }
    }
  }
)
Func mrr_breakdown(
  dataset: Dataset = saas_dataset,
  mrr_amount: VizFieldRef = r(mrr_transactions.mrr_amount)
) {
  VizBlock { viz: CombinationChart { dataset: dataset ... } }
}
```

Stored in `library/blocks/` folder. Dashboard builders browse, filter by category, and add blocks with a few clicks.

---

## 5. Dashboard Settings and Delivery

### Settings block

```aml
settings {
  timezone: 'America/Los_Angeles'
  cache_duration: 360          // minutes
  autorun: true                // auto-load on open
}
```

### Export options

**Local**: PDF, PNG, Excel (.xlsx).

**Scheduled delivery**: Email (PNG/PDF/CSV/Excel, custom HTML body with `{{$dashboard_title}}`, `{{$today}}`), Slack (PNG/PDF), Google Sheets (max 15,000 rows), SFTP, Telegram.

**Sharing**: Shareable links (password-protected), Embedded Analytics (iframe with JWT-based auth, HMAC 256 signature, multi-tenancy, white-labeling).

---

## 6. Best Practices for Dashboard Design

### User-first design

Consider who uses the dashboard and their goals before building. Match color palette to organizational branding.

### Information hierarchy

Most important data in **top-left** (prime real estate). Supporting details and trends below. Data tables and specifics at the bottom.

### Three-level approach

- **Level 1** = high-level KPIs and trendlines (optimize filters for drill-through)
- **Level 2** = detailed breakdowns via drill-through
- **Level 3** = action-driven with data alerts

### Chart selection guidance

Use Column/Bar for category comparison. Line/Area for trends over time. Pie only for **few categories with large differences**. Combination for mixed scales. Scatter for correlations. Tables for raw data inspection. See `build-charts.md` for the full decision tree.

### Formatting rules

Never exceed 3-4 numerals (use abbreviations like 5.2M). Don't mix precision levels or big/small measures on same scale. Use Combination Chart with dual axes for different-scale measures.

### Performance

Maximum **10-15 widgets per dashboard**. Break large dashboards into multiple with drill-through navigation. Disable auto-run for heavy dashboards. Use caching strategically.

### Key limits

| Constraint | Value |
|-----------|-------|
| Max columns in Legend/Pivot Column | **100** |
| Recommended max widgets per dashboard | **10-15** |
| Google Sheets export max rows | **15,000** |
| Supported currencies | **28** |
| Custom chart definitions | **Admins only** |
| Mass filter input | **2,000 values** |
