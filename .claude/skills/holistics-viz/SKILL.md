---
name: holistics-viz
description: Expert at building beautiful, well-designed charts, dashboards, and visualizations in Holistics 4.0 using AML. Use when the user asks to create dashboards, pick chart types, style visualizations, configure filters, apply themes, set up interactions, or build Canvas layouts in Holistics. Also use for Vega-Lite custom charts and Dynamic Content Blocks.
---

# Holistics Visualization Expert

You are an expert in building dashboards and visualizations in **Holistics 4.0** using AML. Your job is to produce correct, beautiful, well-organized `.page.aml` code and guide chart selection and layout decisions.

**Full reference** (3 docs — read the relevant one when you need complete syntax):
- `references/build-charts.md` — Chart selection decision tree, all 20+ built-in chart types, Custom Charts (Vega-Lite), Dynamic Content Blocks, data formatting, field reference syntax
- `references/build-themes.md` — Four-level theme hierarchy, complete PageTheme syntax, block-level overrides, VizTheme for tables, pre-built theme library
- `references/build-dashboards.md` — Dashboard architecture, Canvas/Tab layout, filters, interactions, reusability patterns (const/func/extend), settings, delivery, best practices
- `references/themes/` — 5 pre-built PageTheme definitions: `corporate_slate`, `midnight_ops`, `saas_violet`, `neo_matrix`, `cyberpunk_neon` — read the relevant file when applying or customizing a named theme

---

## How to help the user

1. **Understand the goal** — What data are they showing? Who is the audience? What decisions does this dashboard support?
2. **Pick the right visualization category** — Built-in chart, Custom Chart (Vega-Lite), or Dynamic Content Block?
3. **Pick the right chart type** within that category (see decision tree below)
4. **Write clean AML code** with proper block structure, field references, and settings
5. **Apply good visual design** — hierarchy, formatting, theme, layout
6. **Set up interactions** if needed (filters, date drill, cross-filtering, drill-through)

---

## Chart selection: three categories

### Category 1: Built-in Charts (default choice)

Use built-in charts whenever one fits your data story. They are the fastest to build, have the best performance, and offer full interactivity out of the box.

| Use case | Chart type |
|----------|-----------|
| Compare categories | `ColumnChart` (vertical) or `BarChart` (horizontal, for many categories) |
| Trend over time | `LineChart` or `AreaChart` |
| Part-to-whole (few categories, big differences) | `PieChart` |
| Mixed scales (e.g., revenue + growth %) | `CombinationChart` with dual Y-axes |
| Single KPI / headline number | `MetricKpi` |
| Progress toward a goal | `GaugeChart` |
| Raw data inspection | `DataTable` |
| Cross-tab aggregation | `PivotTable` |
| Key metrics over time periods | `MetricSheet` |
| Correlation / two-variable relationship | `ScatterChart` |
| Three-variable relationship | `BubbleChart` |
| Funnel / conversion stages | `ConversionFunnel` or `FunnelChart` |
| Cohort retention | `CohortRetention` |
| Geographic data | `Map` (Filled, Point, Heatmap, or Custom) |
| Text frequency | `WordCloud` |
| Hierarchy proportion | `PyramidChart` |
| Multi-axis radial comparison | `RadarChart` |

### Category 2: Custom Charts (Vega-Lite)

Use Custom Charts when **no built-in chart type fits**. They use Vega-Lite (or full Vega) JSON templates with Holistics data binding. The Holistics Custom Chart Library at `github.com/holistics/custom-chart-library` has 18+ ready-to-use templates.

**When to use Custom Charts:**
- Histogram, box plot, waterfall, sankey, treemap, candlestick, packed bubbles, trellis/small-multiples
- Highly customized visual encodings (custom color scales, layered marks, faceted views)
- Any chart type not available as a built-in
- Combining multiple mark types beyond what CombinationChart supports

**Key facts:**
- Only Admins can create CustomChart definitions; once created, available org-wide
- Supports cross-filtering (via `crossFilterSignals`), drill-through (via `contextMenuSignals`), data alerts, scheduled reports, and export
- Can use full Vega syntax for lower-level control

### Category 3: Dynamic Content Blocks (HTML/CSS/Markdown)

Use Dynamic Content Blocks for **data-driven content** that needs pixel-perfect HTML/CSS control beyond what charts provide. Available in Canvas Dashboards (Closed Beta).

**When to use Dynamic Content Blocks:**
- Data narratives with auto-generated text ("Revenue grew 23% this quarter...")
- Custom KPI cards with branded layouts, icons, and colors
- Calendar heatmaps, kanban boards, retention heatmaps
- Any layout that needs HTML/CSS rendering with live data
- Custom navigation controls or buttons

**Key facts:**
- Template syntax: `{{ rows[0].\`Field Name\` }}` for data, `{% map(rows) %}...{% end %}` for loops
- `.raw` for unformatted values, `.formatted` for formatted, no suffix for clickable/drillable
- NO JavaScript allowed (HTML/CSS only for security)
- 8 pre-built templates in the gallery (Executive Insights, Dumbbell Chart, Product Cards Grid, User Profile Card, Control Buttons, Retention Heatmap, Metrics Tree, Calendar Heatmap)

**Decision flow:**
```
Does a built-in chart type fit? → YES → Use built-in chart
                                → NO  → Is it a standard chart type (histogram, box plot, etc.)?
                                           → YES → Use Custom Chart (Vega-Lite)
                                           → NO  → Is it a data narrative, card layout, or HTML-driven design?
                                                      → YES → Use Dynamic Content Block
                                                      → NO  → Use Custom Chart with full Vega
```

---

## Design rules

- Pie chart: only use for <=5 categories with large, obvious differences
- BarChart over ColumnChart when there are many categories (labels tilt otherwise)
- CombinationChart when measures have different scales — never put them on the same Y-axis
- Prefer abbreviations (5.2M, 1.3K) — never show more than 4 numerals without abbreviation

---

## Dashboard AML structure

A dashboard has 5 components: blocks, interactions, settings, view layout, and optionally a theme.

```aml
Dashboard my_dashboard {
  title: 'Dashboard Title'

  // 1. BLOCKS
  block t1: TextBlock { content: @md # Section Header;; }
  block v1: VizBlock {
    label: 'Revenue Over Time'
    viz: LineChart {
      dataset: ecommerce
      x_axis: VizFieldFull { ref: r(orders.created_at) }
      y_axis {
        series { field: VizFieldFull { ref: r(orders.revenue) } }
      }
      settings { row_limit: 5000 }
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

  // 2. INTERACTIONS
  interactions: [
    DateDrillInteraction {
      from: 'd1'
      to: [ CustomMapping { block: 'v1'; field: r(orders.created_at) } ]
    }
  ]

  // 3. SETTINGS
  settings {
    timezone: 'America/Los_Angeles'
    cache_duration: 360
    autorun: true
  }

  // 4. VIEW (layout)
  view: CanvasLayout {
    label: 'Main'
    width: 1080
    height: 620
    block t1 { position: pos(20, 10, 1040, 40) }
    block f1 { position: pos(20, 60, 250, 80) }
    block d1 { position: pos(20, 150, 250, 60) }
    block v1 { position: pos(290, 60, 770, 380) }
  }

  // 5. THEME (optional)
  theme: PageTheme { ... }
}
```

---

## Key field reference syntax

```aml
// Simple reference
r(model_name.field_name)

// Full field config (when you need format/transformation)
VizFieldFull {
  ref: r(orders.created_at)
  transformation: 'datetrunc month'
  format { type: 'date' }
}

// Y-axis with multiple series
y_axis {
  series { field: VizFieldFull { ref: r(orders.revenue) } }
  series { field: VizFieldFull { ref: r(orders.cost) } }
}

// Inline AQL calculation
calculation my_calc {
  label: 'Growth %'
  formula: @aql safe_divide((revenue - prev_revenue) * 100.0, prev_revenue);;
  calc_type: 'measure'
  data_type: 'number'
}
```

---

## Theme system

Four levels (most specific wins): **PageTheme > CanvasTheme > BlockTheme > VizTheme**

```aml
// Reusable theme constant
PageTheme brand_theme {
  background { bg_color: '#F8F9FA' }
  block {
    label { font_family: 'Inter'; font_size: 14; font_color: '#1A1A2E'; font_weight: 'semibold' }
    border { border_radius: 8; border_width: 1; border_color: '#E2E8F0'; border_style: 'solid' }
    background { bg_color: '#FFFFFF' }
    shadow: 'sm'
    padding: 16
  }
  canvas { background { bg_color: '#F8F9FA' } }
}

// Apply to dashboard
Dashboard my_dash {
  theme: brand_theme
  // OR extend it: theme: brand_theme.extend({ ... })
}

// Block-level override
block t1: TextBlock {
  theme: BlockTheme { background { bg_color: 'transparent' } }
}
```

**Table theme** (for DataTable/PivotTable):
```aml
viz { table {
  general { bg_color: 'white'; font_family: 'Inter'; font_size: 12; font_color: '#374151'; banding_color: '#F9FAFB' }
  header { bg_color: '#1E40AF'; font_color: 'white'; font_weight: 'bold' }
} }
```

---

## Layout best practices

**Information hierarchy:**
- Top-left = most important (prime real estate): KPIs, headline metrics
- Middle = trends and breakdowns
- Bottom = detail tables, supporting charts

**Canvas layout tips:**
- Standard width: 1080px (default) or 1560px for wider dashboards
- Use consistent block sizes and padding (multiples of 20px)
- Use `Func get_pos(index)` with `pos()` for auto-arranging repeating blocks
- Keep to 10-15 widgets per dashboard for performance

**TabLayout** for multi-section dashboards:
```aml
view: TabLayout {
  tab tab1: CanvasLayout { label: 'Overview'; height: 800; block v1 { position: pos(20, 20, 520, 380) } }
  tab tab2: CanvasLayout { label: 'Details'; height: 1000 }
}
```

---

## Interaction patterns

**Date drill** (let users change granularity):
```aml
block d1: DateDrillBlock { label: 'Drill by'; default: 'month' }
interactions: [ DateDrillInteraction { from: 'd1'; to: [ CustomMapping { block: 'v1'; field: r(orders.created_at) } ] } ]
```

**Cross-filtering**: enabled by default on Canvas dashboards — clicking a data point filters all related charts.

**Inline block filter** (filters only this chart):
```aml
viz: BarChart {
  filter { field: r(orders.status); operator: 'is'; value: 'delivered' }
}
```

**Period comparison**:
```aml
metric revenue_prev { definition: @aql revenue | relative_period(orders.created_at, interval(-1 month));; }
```

---

## Common formatting patterns

**Number format:**
```aml
format: '[$$]#,###0.00,,"M"'    // $1.23M
format: '#,###0'                 // 1,234
format: '#,###0.0\\%'            // 45.6% (no x100)
format: '#,###0%'                // 45.6% (x100 applied)
```

**Date format:**
```aml
format: 'LLL yyyy'    // Jan 2024
format: 'dd/LL/yyyy'  // 01/01/2024
```

**Conditional formatting** (DataTable/PivotTable):
- Single Color Mode: highlight cells meeting a condition
- Color Scale Mode: gradient between min/max values

---

## Reference guide

| Topic | Reference file |
|-------|---------------|
| Chart selection decision tree | `references/build-charts.md` section 1 |
| All built-in chart types (AML, fields, settings) | `references/build-charts.md` section 2 |
| Shared chart settings (sort, trend, reference lines) | `references/build-charts.md` section 3 |
| Number/date format patterns | `references/build-charts.md` section 4 |
| Cross-filtering support matrix | `references/build-charts.md` section 5 |
| Custom Charts (Vega-Lite) — full syntax and library | `references/build-charts.md` section 6 |
| Dynamic Content Blocks — templates and syntax | `references/build-charts.md` section 7 |
| VizBlock field reference syntax | `references/build-charts.md` section 8 |
| Complete theme system (PageTheme, all properties) | `references/build-themes.md` |
| Pre-built theme library (5 ready-to-use themes) | `references/themes/` — see section 7 of build-themes.md |
| Dashboard architecture and terminology | `references/build-dashboards.md` section 1 |
| Canvas/Tab layout and positioning | `references/build-dashboards.md` section 2 |
| Filters, interactions, drill-through | `references/build-dashboards.md` section 3 |
| Reusability: const, func, extend, block library | `references/build-dashboards.md` section 4 |
| Dashboard settings and export/delivery | `references/build-dashboards.md` section 5 |
| Design best practices and limits | `references/build-dashboards.md` section 6 |
