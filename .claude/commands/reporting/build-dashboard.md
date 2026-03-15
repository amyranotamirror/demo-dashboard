# Build Holistics Dashboards and Charts

This workflow helps users build **Holistics dashboards and charts** using AML (`.page.aml` files), including built-in chart types, layout, filters, interactions, and themes.

Trigger this workflow when the user asks to:
- Build or update a Holistics dashboard in code
- Add a chart/visualization block to a dashboard
- Set up filters, date drills, period comparisons, or cross-filtering
- Configure layout (canvas positioning, tabs)
- Apply themes or styling

For **Custom Charts (Vega-Lite)**, use `.claude/commands/reporting/build-custom-chart.md` instead.
For **AMQL models/datasets/metrics**, use `.claude/commands/modeling/build-metric.md` instead.
For **Theme design and preview**, use `.claude/commands/reporting/build-theme.md` instead.

---

## Step 0 — Detect intent

Before doing anything, ask:

1. **What do you already have?**
   - An existing Holistics dataset ready to query → proceed
   - No dataset yet → suggest running `.claude/commands/modeling/build-metric.md` first to define models/datasets

2. **What do you need built?**
   - Full dashboard (all blocks + layout + filters)
   - Specific charts/blocks only
   - Filters and interactions only
   - Layout adjustment or tab restructuring only

3. **Do you have a theme to apply?**
   - Use a built-in theme (`default`, `light`, `dark`, `hextech`, `forest`, `ocean`, `sunset`)
   - Use a custom `PageTheme` (if so, do you have the AML already, or does it need to be built first via `.claude/commands/reporting/build-theme.md`?)
   - No theme needed

Skip any questions the user has already answered in their request.

---

## Step 1 — Understand the dashboard

Ask (for anything not already provided):
1. What dataset(s) are available?
2. What charts/KPIs are needed, and what dimensions/measures do they use?
3. Any filters, date drills, or cross-filtering required?
4. Canvas layout (approximate positions, tabs?) or just the code blocks?
5. Any theme/styling preferences?

---

## Step 2 — Choose chart types

Use this guide to recommend the right type:

| Goal | Recommended chart |
|---|---|
| Compare categories | `ColumnChart` (vertical) or `BarChart` (horizontal, high cardinality) |
| Trend over time | `LineChart` or `AreaChart` |
| Two measures with different scales | `CombinationChart` |
| Part-to-whole (few categories) | `PieChart` |
| Scatter / correlation | `ScatterChart` |
| 3-variable scatter | `BubbleChart` |
| Single prominent KPI | `MetricKpi` |
| Goal progress | `GaugeChart` |
| Raw data with columns | `DataTable` |
| Dimension × dimension aggregation | `PivotTable` |
| Key metrics across time periods | `MetricSheet` |
| Retention analysis | `CohortRetention` |
| Funnel drop-off | `ConversionFunnel` |
| Geographic data (regions) | `Map` (FilledMap mode) |
| Geographic data (coordinates) | `Map` (PointMap mode) |

---

## Step 3 — Generate AML code

Produce complete `.page.aml` code blocks. Structure every dashboard with 5 sections:

```
Dashboard <name> {
  title: '...'

  // 1. BLOCKS
  // 2. INTERACTIONS
  // 3. SETTINGS
  // 4. VIEW (layout)
}
```

---

## Dashboard AML structure

### Full example
```aml
Dashboard revenue_overview {
  title: 'Revenue Overview'

  // BLOCKS
  block t1: TextBlock {
    content: @md ## Revenue Overview;;
  }
  block v1: VizBlock {
    label: 'Monthly Revenue'
    viz: ColumnChart {
      dataset: ecommerce
      x_axis: VizFieldFull { ref: r(orders.created_at) }
      y_axis {
        series { field: VizFieldFull { ref: r(orders.total_revenue) } }
      }
      settings { row_limit: 5000 }
    }
  }
  block v2: VizBlock {
    label: 'Revenue by Country'
    viz: BarChart {
      dataset: ecommerce
      x_axis: VizFieldFull { ref: r(users.country) }
      y_axis {
        series { field: VizFieldFull { ref: r(orders.total_revenue) } }
      }
    }
  }
  block f1: FilterBlock {
    label: 'Date Range'
    type: 'field'
    source: FieldFilterSource {
      dataset: ecommerce
      field: r(orders.created_at)
    }
    default { operator: 'matches'; value: 'last 12 months' }
  }
  block d1: DateDrillBlock { label: 'Drill by'; default: 'month' }

  // INTERACTIONS
  interactions: [
    DateDrillInteraction {
      from: 'd1'
      to: [
        CustomMapping { block: 'v1'; field: r(orders.created_at) }
      ]
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
    label: 'Main'
    width: 1080
    height: 620
    block t1 { position: pos(20, 10, 500, 40) }
    block v1 { position: pos(20, 60, 520, 300) }
    block v2 { position: pos(560, 60, 500, 300) }
    block f1 { position: pos(20, 380, 250, 80) }
    block d1 { position: pos(280, 380, 250, 80) }
  }
}
```

---

## Chart type reference

### ColumnChart / BarChart
```aml
viz: ColumnChart {
  dataset: my_dataset
  x_axis: VizFieldFull { ref: r(products.category) }
  y_axis {
    series { field: VizFieldFull { ref: r(orders.total_revenue) } }
    series { field: VizFieldFull { ref: r(orders.order_count) } }  // optional 2nd series
  }
  legend: VizFieldFull { ref: r(orders.status) }    // optional breakdown
  settings {
    row_limit: 5000
    legend_label: 'top'     // top|bottom|left|right
  }
}
```

### LineChart / AreaChart
```aml
viz: LineChart {
  dataset: my_dataset
  x_axis: VizFieldFull { ref: r(orders.created_at) }
  y_axis {
    series { field: VizFieldFull { ref: r(orders.total_revenue) } }
  }
}
```

### CombinationChart (dual-axis, mixed mark types)
```aml
viz: CombinationChart {
  dataset: my_dataset
  x_axis: VizFieldFull { ref: r(orders.created_at) }
  y_axis {
    series { field: VizFieldFull { ref: r(orders.total_revenue) } }       // left axis
    series { field: VizFieldFull { ref: r(orders.mom_growth_pct) } }      // right axis
  }
  // Set chart type per series and axis alignment in the UI settings
}
```

### PieChart / Donut
```aml
viz: PieChart {
  dataset: my_dataset
  legend: VizFieldFull { ref: r(products.category) }
  series {
    field { ref: r(orders.total_revenue) }
  }
}
```

### DataTable
```aml
viz: DataTable {
  dataset: my_dataset
  fields: [
    VizFieldFull { ref: r(orders.id) },
    VizFieldFull { ref: r(orders.created_at) format { type: 'date' } },
    VizFieldFull { ref: r(orders.total_revenue) format { type: 'number' } }
  ]
  settings { row_limit: 5000 }
}
```

### PivotTable
```aml
viz: PivotTable {
  dataset: my_dataset
  rows:    [ VizFieldFull { ref: r(users.country) } ]
  columns: [ VizFieldFull { ref: r(orders.status) } ]
  values:  [ VizFieldFull { ref: r(orders.order_count) } ]
}
```

### MetricKpi (single number)
```aml
viz: MetricKpi {
  dataset: my_dataset
  calculation current_value {
    label: 'Revenue'
    formula: @aql sum(orders.amount);;
    calc_type: 'measure'
    data_type: 'number'
  }
}
```

### ScatterChart / BubbleChart
```aml
viz: ScatterChart {
  dataset: my_dataset
  x_axis: VizFieldFull { ref: r(orders.avg_order_value) }
  y_axis { series { field: VizFieldFull { ref: r(orders.order_count) } } }
  group: VizFieldFull { ref: r(users.country) }    // optional color grouping
}

viz: BubbleChart {
  dataset: my_dataset
  x_axis: VizFieldFull { ref: r(products.price) }
  y_axis { series { field: VizFieldFull { ref: r(orders.revenue) } } }
  z_axis: VizFieldFull { ref: r(orders.order_count) }    // bubble size
  group: VizFieldFull { ref: r(products.category) }
}
```

### GaugeChart
```aml
viz: GaugeChart {
  dataset: my_dataset
  value:     VizFieldFull { ref: r(orders.total_revenue) }
  max_value: VizFieldFull { ref: r(targets.revenue_target) }
}
```

---

## Block-level inline filters

```aml
viz: ColumnChart {
  dataset: my_dataset
  filter {
    field: r(users.country)
    operator: 'is'
    value: 'Vietnam'
  }
  filter {
    field: r(orders.created_at)
    operator: 'last'
    value: 12
    modifier: 'month'
  }
  // ...
}
```

---

## Filters and interactions

### Field FilterBlock
```aml
block f1: FilterBlock {
  label: 'Country'
  type: 'field'
  source: FieldFilterSource {
    dataset: ecommerce
    field: r(users.country)
  }
  default { operator: 'is'; value: 'Vietnam' }
}
```

### Date drill
```aml
block d1: DateDrillBlock { label: 'Drill by'; default: 'month' }

interactions: [
  DateDrillInteraction {
    from: 'd1'
    to: [
      CustomMapping { block: 'v1'; field: r(orders.created_at) }
      CustomMapping { block: 'v2'; field: r(orders.created_at) }
    ]
  }
]
```

### Period-over-period (AQL in metric)
```aml
metric revenue_last_month {
  definition: @aql revenue | relative_period(orders.created_at, interval(-1 month));;
}
```

---

## Layout

### Canvas layout (`pos(x, y, width, height)` all in pixels)
```aml
view: CanvasLayout {
  label: 'Main'
  width: 1560
  height: 1080

  block v1 { position: pos(20, 20, 760, 300) }
  block v2 { position: pos(800, 20, 740, 300) }
  block f1 { position: pos(20, 340, 250, 80) }
}
```

### Tab layout
```aml
view: TabLayout {
  label: 'Main'
  tab products: CanvasLayout {
    label: 'Products'
    height: 800
    block v1 { position: pos(20, 20, 760, 300) }
  }
  tab sales: CanvasLayout {
    label: 'Sales'
    height: 800
    block v2 { position: pos(20, 20, 760, 300) }
  }
}
```

### Auto-arrange with functions
```aml
const col_w = 240
const col_h = 200
const gap = 10

Func col_pos(i: Number) {
  pos(i * (col_w + gap), 0, col_w, col_h)
}

view: CanvasLayout {
  width: 1200; height: 400
  block v1 { position: col_pos(0) }
  block v2 { position: col_pos(1) }
  block v3 { position: col_pos(2) }
}
```

---

## Themes

> For a full theme design workflow with HTML preview and comprehensive `PageTheme` syntax, see `.claude/commands/reporting/build-theme.md`.

### Apply an existing theme
```aml
Dashboard my_dash {
  theme: H.themes.default  // built-in system theme
  // or
  theme: my_custom_theme   // custom PageTheme declared in themes.aml
  // or
  theme: classic_blue.extend({ block { background { bg_color: 'white' } } })
}
```

Built-in system themes: `default`, `light`, `dark`, `hextech`, `forest`, `ocean`, `sunset`

### Define a local theme inline

Use `PageTheme { background { } canvas { } block { label { } text { } border { } background { } padding shadow } viz { table { general { } header { } } } custom_css: @css ... ;; }` inline. For full property reference and HTML preview workflow, see `.claude/commands/reporting/build-theme.md`.

### Override a single block's theme
```aml
Dashboard my_dash {
  theme: my_custom_theme

  block hero: TextBlock {
    theme: BlockTheme {
      background { bg_color: 'transparent' }
      border { border_width: 0 }
      padding: 0
    }
  }
}
```

### Custom font via Google Fonts
```aml
Dashboard my_dash {
  theme: PageTheme {
    block {
      label { font_family: 'Poppins, sans-serif' }
      text  { font_family: 'Poppins, sans-serif' }
    }
    custom_css: @css
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    ;;
  }
}
```

---

## Reusability patterns

### Function (parameterized block)
```aml
Func order_pie(country: String) {
  VizBlock {
    label: '# of Orders in ${country}'
    viz: PieChart {
      dataset: ecommerce
      filter { field: r(countries.name); operator: 'is'; value: '${country}' }
      legend: r(products.category)
      series { field { ref: r(orders.total_orders_count) } }
    }
  }
}

Dashboard demo {
  block v1: order_pie('Vietnam')
  block v2: order_pie('Germany')
}
```

### Constants
```aml
const total_orders = r(ecommerce_orders.total_orders_count)
const row_limit = 5000
```

---

## Key limits to mention when relevant

| Constraint | Value |
|---|---|
| Max legend / pivot columns | 100 |
| Recommended max blocks per dashboard | 10–15 |
| Google Sheets export | 15,000 rows max |
| Cross-filtering | Enabled by default on Canvas dashboards |
| Custom chart definitions | Admins only |

---

## Best practices

- **Top-left = most important**: KPIs and headline metrics go first
- **Date dimension + X-axis**: Can only sort by that date dimension, not by measure
- **Pie charts**: Only for ≤5 categories with clearly visible size differences
- **Combination chart**: Use whenever two measures have very different numeric scales
- **Performance**: Disable `autorun: false` for heavy dashboards; use `cache_duration`
- **Cross-filtering**: Works automatically across blocks from the same dataset
- **Block filters + dashboard filters**: Combined with AND; dashboard filters do NOT override block-level filters
