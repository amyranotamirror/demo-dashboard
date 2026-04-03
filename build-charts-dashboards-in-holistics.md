# Holistics Visualization & Dashboard Complete Reference

Holistics provides a full-stack analytics visualization platform where dashboards and charts are defined as code using AML (Analytics Modeling Language), backed by Vega-Lite for custom charts, and configured through both a visual editor and code editor. **This reference covers every visualization type, configuration parameter, AML syntax pattern, and dashboard construct** available in Holistics 4.0 as of March 2026. The platform supports 20+ built-in chart types, Canvas Dashboards with pixel-perfect layout control, a four-level theme system, interactive controls (filters, date drills, period comparisons, cross-filtering, drill-through), and extensible Custom Charts via Vega-Lite.

---

## 1. Architecture and core concepts

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

## 2. Complete chart type reference

### All built-in visualization types with AML names

| Category | Chart Type | AML Name | Key Fields |
|----------|-----------|----------|------------|
| **Tables** | Data Table | `DataTable` | fields (any dimensions/measures) |
| | Pivot Table | `PivotTable` | rows, columns, values |
| | Metric Sheet | `MetricSheet` | date_field, rows (metrics) |
| | Cohort Retention | `CohortRetention` | cohort, cohort_size, duration, value |
| | Conversion Funnel | `ConversionFunnel` | values (multiple measures = steps), breakdown |
| **KPI/Metrics** | KPI Metric | `MetricKpi` | value, comparison_value |
| | Gauge Chart | `GaugeChart` | value, max_value |
| **Charts** | Line Chart | `LineChart` | x_axis, y_axis, legend |
| | Area Chart | `AreaChart` | x_axis, y_axis, legend |
| | Column Chart | `ColumnChart` | x_axis, y_axis, legend |
| | Bar Chart | `BarChart` | x_axis, y_axis, legend |
| | Combination Chart | `CombinationChart` | x_axis, y_axis (primary + secondary), legend |
| | Pie / Donut Chart | `PieChart` | legend, y_axis (series) |
| | Scatter Chart | `ScatterChart` | x_axis, y_axis, group, label |
| | Bubble Chart | `BubbleChart` | x_axis, y_axis, z_axis (size), group, label |
| | Pyramid Chart | `PyramidChart` | legend, y_axis |
| | Funnel Chart | `FunnelChart` | legend, y_axis |
| | Radar Chart | `RadarChart` | legend or x_axis, y_axis |
| | Word Cloud | `WordCloud` | words (dimension), words_count (measure) |
| **Maps** | Geo Map | `Map` | location, legend, value, lat, long |
| **Custom** | Custom Chart | `CustomChart` | user-defined fields via Vega-Lite |
| **Content** | Dynamic Content Block | (Closed Beta) | HTML/CSS templates + data binding |

---

### 2.1 Column Chart (`ColumnChart`)

**Purpose**: Vertical bars comparing values between discrete categories. One of the most common visualizations.

**Fields**:
- **X-axis** (required): Categories to compare
- **Y-axis** (required): Measure to display
- **Legend** (optional): Sub-categories breaking down measures
- **Tooltip** (optional): Additional hover context fields (treated as measures)

**Settings and styling options**:

| Setting | Description | Values |
|---------|-------------|--------|
| X-axis Title | Custom axis label | String |
| Y-axis Title | Custom axis label | String |
| Y-axis Align | Position of Y-axis | `left`, `right` |
| Y-axis Scale | Scaling type | `Linear`, `Logarithmic` |
| Y-axis Min/Max | Custom axis range | Number (defaults to data range) |
| Show data label | Display values on bars | Boolean |
| Stack series | Stack groups on each other | `none`, `raw value`, `percentage` (100% stacked) |
| Display Total in tooltip | Show totals per measure | Boolean (only with Legend) |
| Group small values into Others | Consolidate small groups | Boolean + count of displayed groups |
| Show rows with no data | Include empty categories | Boolean |
| Legend Display label | Show/hide legend | Boolean |
| Legend Alignment | Legend position | `top`, `bottom`, `left`, `right` |
| row_limit | Max rows queried | Number (default varies) |

**AML example**:
```aml
block v1: VizBlock {
  label: 'Orders by Category'
  viz: ColumnChart {
    dataset: demo_ecommerce
    x_axis: VizFieldFull { ref: r(products.category) }
    y_axis {
      series { field: VizFieldFull { ref: r(orders.total_orders_count) } }
    }
    settings {
      row_limit: 5000
      legend_label: 'top'
    }
  }
}
```

**Supports**: Reference lines, trend lines, cross-filtering, date drill, sorting, tooltips.

### 2.2 Bar Chart (`BarChart`)

**Purpose**: Horizontal bars — identical to Column Chart but horizontal. Preferred for **high-cardinality dimensions** where vertical column labels would tilt.

**Fields**: Same as Column Chart (X-axis, Y-axis, Legend, Tooltip).

**All settings identical to Column Chart.** Key best practice: **always sort bars by Y-axis values** in descending order.

### 2.3 Line Chart (`LineChart`)

**Purpose**: Series of points connected by lines, examining trends of continuous variables over a dimension (typically time).

**Fields**:
- **X-axis** (required): Dimension (normally time)
- **Y-axis** (required): Measure(s)
- **Legend** (optional): Split series by dimension
- **Tooltip** (optional): Additional hover fields

**Additional settings beyond Column Chart**:

| Setting | Description | Values |
|---------|-------------|--------|
| Always display points | Show disconnected data points | Boolean (STYLE > Others) |
| Line interpolation | Line connection style | `Linear`, `Smooth`, `Step`, `Step Before`, `Step After` |
| Line style | Line pattern | `Solid`, `Dotted`, `Dashed` |
| Multiple Y-axes | Secondary axis for different scales | Max 2 recommended, aligned opposite sides |

**Multiple series configurations**:
1. Legend field splits one measure into multiple series
2. Multiple measures on same Y-axis (same scale only)
3. Multiple measures on separate Y-axes (different scales, max 2 recommended)

### 2.4 Area Chart (`AreaChart`)

**Purpose**: Extension of Line Chart showing volume through filled area. Compare change of volumes over time or distribution as parts of a whole.

**Three modes**: Standard (quantity over time), Stacked (contribution over time), 100% Stacked (proportional contribution).

**All settings same as Line Chart.** Key: select the correct stacking option. Not recommended to add multiple Y-axes.

### 2.5 Combination Chart (`CombinationChart`)

**Purpose**: Combines Area, Line, Bar, and Column chart types in one visualization. Essential for displaying measures of **different scales** together.

**Unique feature**: Choose chart type **per measure** in the Settings tab (e.g., revenue as columns, growth rate as line). Supports dual Y-axes aligned left/right.

**AML example with parameters**:
```aml
Func mrr_breakdown(
  dataset: Dataset = saas_dataset,
  mrr_amount: VizFieldRef = r(mrr_transactions.mrr_amount),
  break_down_dimension: VizFieldRef = r(mrr_transactions.subscription_type),
  date: VizFieldRef = r(mrr_transactions.created_at),
  comparison_period: Number = 12
) {
  VizBlock {
    viz: CombinationChart {
      dataset: dataset
      calculation metric {
        formula: @aql sum(${mrr_amount.model}.${mrr_amount.field});;
      }
      legend: VizFieldFull {
        ref: break_down_dimension
        format { type: 'text' }
      }
      filter {
        field: date
        operator: 'last'
        value: comparison_period
        modifier: 'month'
      }
    }
  }
}
```

### 2.6 Pie Chart and Donut Chart (`PieChart`)

**Purpose**: Circle divided into sectors showing proportions. Best for highlighting large differences between a few categories.

**Fields**:
- **Legend** (required): Categorical variable (sectors)
- **Y-axis/Series** (required): Measure (sector size)
- **Tooltip** (optional)

**No X-axis field**. Uses `display_as_donut: true/false` setting to toggle donut mode.

**Settings**:

| Setting | Description |
|---------|-------------|
| Display as donut | Toggle donut ring shape |
| Show data label | Display raw values on sectors |
| Show Total | Display total value |
| Show percentage | Display % instead of raw |
| Group small values into Others | Consolidate small categories |

**AML example with functions**:
```aml
Func get_order_pie(country: String) {
  VizBlock {
    label: '# of Orders in ${country}'
    viz: PieChart {
      dataset: demo_ecommerce
      filter {
        field: r(ecommerce_countries.name)
        operator: 'is'
        value: '${country}'
      }
      legend: r(products.category)
      series {
        field { ref: r(orders.total_orders_count) }
      }
    }
  }
}
```

### 2.7 Scatter Chart (`ScatterChart`)

**Purpose**: Two-variable coordinate plot showing relationships/correlations.

**Fields**: X-axis (required), Y-axis (required), **Group** (optional — different shapes/colors per category), **Label** (optional — labels data points in tooltips).

### 2.8 Bubble Chart (`BubbleChart`)

**Purpose**: Extension of Scatter Chart with a **Z-axis** for bubble size (third dimension). Z-axis only accepts continuous variables.

### 2.9 Pyramid and Funnel Charts (`PyramidChart`, `FunnelChart`)

**Pyramid**: Triangle divided into horizontal sections — visualizes hierarchy from smallest (top) to largest (bottom).

**Funnel**: Inverted pyramid — represents stages of a process and drop-offs.

**Fields**: Legend (required, categorical), Y-axis (required, numerical).

**Settings**: Show data label, Show Total, Show percentage, Group small values into Others.

### 2.10 Radar Chart (`RadarChart`)

**Purpose**: Multivariate data on axes radiating from center. Ideal for comparing subjects across ordinal measurements of the **same scale**.

**Two modes**: (1) Multiple subjects on multiple measurements: Name/ID in Legend, measurements in Y-axis. (2) Multiple subjects on one measurement: Name/ID in X-axis.

### 2.11 Word Cloud (`WordCloud`)

**Purpose**: Text frequency visualization. Font size driven by word count/weight.

**Fields**: Words (dimension), Words Count (measure).

### 2.12 Gauge Chart (`GaugeChart`)

**Purpose**: Visualize progress toward a goal.

**Fields**: Value (current progress measure), Max Value (goal measure).

---

### 2.13 Data Table (`DataTable`)

**Purpose**: Default visualization for raw data display with full variable comparison.

**Configuration**:

| Setting | Description |
|---------|-------------|
| Pagination Size | Rows per page |
| Row Number | Show row numbers |
| Text Wrap | Wrap header text / Wrap cell text (disable for performance) |
| Column Freeze | Number of left-frozen columns |
| Single-cell display | `Large` (prominent single value) or `Normal` |
| Table color | Color theme for headers, banding, body |
| Text and spacing | `Compact`, `Normal`, `Wide` presets |
| Border styles | Customize which borders to show |
| Sum Row | Display column sums |
| Average Row | Display column averages |
| Show rows with no data | Toggle in STYLE > Others |

**Conditional Formatting**:
- **Single Color Mode**: Highlights cells meeting a condition with chosen color
- **Color Scale Mode**: Gradient based on value range (Min/Max required, Midpoint optional)

**Columns can be hidden/shown**. Sort by one or many fields simultaneously.

**AML example**:
```aml
block v2: VizBlock {
  label: 'Order Details'
  viz: DataTable {
    dataset: demo_ecommerce
    fields: [
      VizFieldFull { ref: r(orders.order_id) },
      VizFieldFull { ref: r(orders.created_at) format { type: 'date' } },
      VizFieldFull { ref: r(orders.revenue) format { type: 'number' } }
    ]
    settings { row_limit: 5000 }
  }
}
```

### 2.14 Pivot Table (`PivotTable`)

**Purpose**: Excel-like pivot aggregation by combinations of dimensions and measures.

**Fields**: At least one of **Rows**, **Columns**, **Values** (max 100 columns).

**Settings**:

| Setting | Description |
|---------|-------------|
| Column Grand Total | Summary row across all rows |
| Row Grand Total | Summary column across all columns |
| Sub-totals | Aggregate within sub-categories |
| Display empty cell as 0 | Convert empty cells |
| Show as rows/columns | Toggle value orientation |
| Column Freeze | Freeze row field columns from left |

**Totals** are calculated via additional queries with fewer dimensions. Conditional formatting supported.

**AML example**:
```aml
block order_pivot: VizBlock {
  label: 'Orders by Country & Status'
  viz: PivotTable {
    dataset: demo_ecommerce
    rows: [ VizFieldFull { ref: r(countries.name) } ]
    columns: [ VizFieldFull { ref: r(orders.status) } ]
    values: [ VizFieldFull { ref: r(orders.total_orders_count) } ]
    settings { }
  }
}
```

### 2.15 Metric Sheet (`MetricSheet`)

**Purpose**: Bird's-eye view of key metrics in spreadsheet format across time periods. Combines fresh database data with Excel-like format.

**Fields**: Date Field (required), Rows (metrics — each displayed as a row).

**Date aggregation options**: Daily, Weekly, Monthly, Quarterly, Yearly, Week-to-Date, Month-to-Date, Year-to-Date.

**Special features**: Sparklines (mini line charts), configurable number of time columns, heading/notes color, indent for hierarchy. Fully supports non-additive metrics (COUNT DISTINCT recalculated per period).

### 2.16 KPI Metric (`MetricKpi`)

**Purpose**: Single prominent number for performance snapshots.

**Fields**: Value (required measure), Comparison Value (optional).

**Comparison modes**: None, Compare by number, Compare by percent, Progress (bar).

**Settings**:

| Setting | Description |
|---------|-------------|
| Alignment | Position of all KPI elements |
| Label font size/color | KPI label styling |
| Metric Value font size/color | Main number styling |
| Reverse comparison color | Flip green/red (for metrics where lower is better) |
| Progress bar color | Bar color for Progress mode |

**AML example**:
```aml
Func kpiWidget(fieldRef: FieldRef, offset: Number) {
  VizBlock {
    label: 'KPI'
    viz: MetricKpi {
      dataset: aql_dataset
      calculation calc {
        label: 'Value'
        formula: @aql ${fieldRef.model}.${fieldRef.field}
          | relative_period(orders.created_at, interval(-${offset} month));;
        calc_type: 'measure'
        data_type: 'number'
      }
    }
  }
}
```

### 2.17 Cohort Retention (`CohortRetention`)

**Purpose**: Retention analysis heatmap showing continued engagement over time.

**Fields**: Cohort (dimension), Cohort Size (measure), Duration (dimension), Value (measure). Duration sorted alphabetically — use numerical representation for correct ordering.

### 2.18 Conversion Funnel (`ConversionFunnel`)

**Purpose**: Journey visualization showing conversion rates between steps.

**Fields**: Values (multiple measures = funnel steps), Breakdown (optional dimension). Has both chart and table components. Column and circle colors customizable.

### 2.19 Maps

**Four map types**:

| Type | Fields | Purpose |
|------|--------|---------|
| **Filled Map** (Choropleth) | Location + Value + Legend | Polygon regions colored by value |
| **Point Map** | Latitude + Longitude + Value + Legend | Bubbles on map at coordinates |
| **Heatmap** | Latitude + Longitude + Value | Density/magnitude visualization |
| **Custom Map** | Location (GeoJSON) + Value + Legend | Custom geographies via uploaded GeoJSON |

**Map styling options**:

| Setting | Values |
|---------|--------|
| Map background | Light, Dark, Street, Satellite, Outdoor |
| Color style | Smooth (gradient), Steps (discrete blocks) |
| Min/Mid/Max | Auto, Number, or Percent with custom values |
| Color scale layout | Horizontal, Vertical |
| Show color scale | Boolean |
| Point size (Point Map) | 1–10 |
| Size scale (Point Map) | Linear, Logarithmic |
| Opacity (Heatmap) | 0–1 |
| Intensity (Heatmap) | Controls colored area size |

**Location types for Filled Map**: Country, State/Province (must match supported formats or abbreviations).

---

## 3. Shared chart settings across all chart types

### Sorting

**Supported on**: All tables, Area, Line, Column, Bar, Combination, Pie, Pyramid, Funnel charts.

- Sort by one or many fields; priority = vertical order in Sort section
- **Date dimension constraint**: If chart uses Date in X-axis, can only sort by that dimension
- Sort applied **AFTER** row limit by default
- Dashboard viewer sorting is temporary (resets on refresh)
- AML custom chart sorting: `sort { apply_order: 1, direction: "asc" }`

### Trend lines

**Supported on**: Line, Column, Bar, Area, Combination charts (requires numerical X-axis).

| Type | Description |
|------|-------------|
| Linear | Steady increase/decrease |
| Logarithmic | Fast initial change, then flattening |
| Power | Accelerating curve (no zero/negative values) |
| Exponential | Very steep growth (no zero/negative values) |
| Moving Average | Smoothed fluctuations; customizable period count |

Toggles: **Break down by legend** (default ON), **Merge into one line**.

### Reference lines

**Supported on**: Line, Column, Bar, Area, Combination charts.

- **Constant value** (e.g., goal line) or **computed value** (e.g., average)
- Unlimited reference lines per chart
- With Legend: auto-generates per legend value
- Same toggles: Break down by legend, Merge into one line

### Tooltip customization

Drag fields into Tooltip area — all treated as measures with customizable aggregation. **Supported on**: Line, Column, Bar, Area, Pie, Funnel, Pyramid, Scatter, Bubble, Filled Map, Point Map charts.

### Legend limits and ordering

- **Maximum 100 legend values** displayed (preview of first 100 if exceeded)
- Default sort: **alphabetical** (community workaround available for custom ordering)
- Viewers can hide/unhide items by clicking legend entries

### Line interpolation (Line/Area/Combination)

Five modes: **Linear** (default), **Smooth**, **Step**, **Step Before**, **Step After**.

Three line styles: **Solid**, **Dotted**, **Dashed**.

---

## 4. Canvas Dashboard blocks and layout

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

**Tab features**: On-demand loading, smart caching, sync blocks (synchronized across tabs), cross-tab interactions (manually enabled). Recommended: under 10 tabs, ≤100 blocks total.

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

## 5. Theme system (four levels)

### Theme hierarchy

**PageTheme → CanvasTheme → BlockTheme → VizTheme** (most specific wins).

### Two theme types

- **Pre-built themes**: System (Holistics built-in) + Custom (org-wide reusable)
- **Local themes**: Ad-hoc per-dashboard

### Complete PageTheme syntax

```aml
PageTheme classic_blue {
  // PAGE BACKGROUND
  background {
    bg_color: "#FFFFFF"
    bg_image: "linear-gradient(blue, red)"  // or URL string
    bg_repeat: false    // false, true, "x", "y", "space", "round"
    bg_size: "cover"    // "cover", "contain"
  }

  // CANVAS THEME
  canvas {
    border {
      border_radius: 4          // Number, String, or DetailedRadius
      border_width: 1           // Number, String, or DetailedSpacing
      border_color: "#4896EA"
      border_style: "solid"     // none|solid|dotted|dashed|inset|outset|ridge|groove|double
    }
    background { bg_color: "#D1E5FA" }
    shadow: "none"              // none|sm|md|lg
    opacity: 1                  // 0–1
  }

  // BLOCK THEME
  block {
    label {
      font_family: "Inter"
      font_size: 14
      font_color: "#1357A0"
      font_weight: "medium"     // light|normal|medium|semibold|bold|extrabold
      font_style: "normal"      // normal|italic
    }
    text {
      font_family: "Inter"
      font_size: 12
      font_color: "#1357A0"
      font_weight: "normal"
      font_style: "normal"
    }
    border {
      border_width: 1
      border_radius: 8
      border_color: "#4896EA"
      border_style: "solid"
    }
    background { bg_color: "#E8F2FD" }
    padding: 12                 // Number, String, or DetailedSpacing {top,left,bottom,right}
    shadow: "none"
    opacity: 1
  }

  // VIZ THEME (Table family)
  viz {
    table {
      general {
        bg_color: 'white'
        hover_color: '#C8DCF2'
        banding_color: '#EAF5FC'
        font_size: 12
        font_color: '#505D6A'
        font_family: 'Arial'
        border_color: '#90A2B7'
        border_width: 1
        grid_color: '#90A2B7'
      }
      header {
        bg_color: '#608EC3'
        font_size: 12
        font_color: 'white'
        font_weight: 'bold'
      }
      sub_header {                // Pivot Table sub-headers
        bg_color: '#AECEF2'
        font_size: 12
        font_color: '#505D6A'
        font_weight: 'bold'
      }
      sub_title {                 // Metric Sheet subtitles
        font_size: 12
        font_color: '#505D6A'
        font_weight: 'bold'
      }
    }
  }

  // CUSTOM CSS
  custom_css: @css
    @import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');
    /* any custom CSS rules */
  ;;
}
```

### Applying themes

```aml
// System theme
Dashboard my_dash { theme: H.themes.name }

// Custom reusable theme (declared as constant)
Dashboard my_dash { theme: classic_blue }

// Local theme
Dashboard my_dash { theme: PageTheme { ... } }

// Extended theme
Dashboard my_dash { theme: classic_blue.extend({ ... }) }
```

### Block-level overrides

```aml
block text_block: TextBlock {
  theme: BlockTheme { background { bg_color: 'transparent' } }
}

block viz_block: VizBlock {
  viz: PivotTable {
    theme: VizTheme { table { general { bg_color: 'white' } } }
  }
}
```

---

## 6. Filters, interactions, and controls

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
1. **Per-visualization**: Click measure → "Add calculation: Period-over-period comparison"
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

**Enabled by default** for Canvas dashboards. Click any data point → all dimension values become filters across the dashboard. Uses all dimensions from clicked record; applies to widgets from same dataset or models with relationships.

**Disable per-block**: Block Preferences → Cross-filtering → toggle off.

**Supported on**: Table, Pivot Table, Line/Bar/Column/Area/Combination, Pie/Funnel/Pyramid, Scatter/Bubble, Custom Charts (with signal setup).

### Drill-through

Navigate from source to target dashboard, passing clicked data values as filter parameters. Target dashboard must have Field Filters with **drill-through enabled**. Auto or Custom mode for controlling which dashboards link.

### Drill Down and Break Down

**Zero configuration required** — work immediately. Right-click any data point → Break Down by any dimension, or Drill Down through hierarchy.

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

## 7. Data formatting reference

### Number format (AML)

**Shorthand**: `format: "#,###[$$]"` or `format: '[$$]#,###0.00,,"M"'`

**Full syntax**:
```aml
dimension price {
  type: "number"
  format: FullNumberFormat {
    pattern: '[$$]#,###0.00,,"\\M"'
    groupSeparator: " "     // comma (default), space, dot
    decimalSeparator: "."   // dot (default), comma
  }
}
```

**Pattern components** (order: Currency → Group Separator → Fraction → Percentage → Abbreviation):

| Component | Syntax | Example |
|-----------|--------|---------|
| Currency | `[$€]`, `[$$]` | `$54`, `1,236€` |
| Group separator | `#,###` | `586,347` |
| Fraction | `0.00` | 2 decimal places |
| Percentage | `%` (×100) or `\\%` (no multiply) | `1,234.6%` |
| Abbreviation | `,"K"`, `,,"M"`, `,,,"B"` | `0.124M` |

**28 supported currencies**: $, €, ¥, £, 元, ₺, ₩, ₽, ₹, ₨, ₱, A$, C$, S$, NZ$, HK$, ₪, R$, ฿, R, Fr, kr, Ft, Rp, RM, VND, Tk.

### Date format (AML)

```aml
dimension order_created_at {
  type: "date"
  format: "dd LLL, yyyy"    // 12 Jan, 2002
}
```

| Token | Meaning | Example |
|-------|---------|---------|
| `dd` | Day (2-digit) | 01, 12 |
| `LL` | Month (numeric) | 08 |
| `LLL` | Month (abbreviation) | Jan |
| `yyyy` | Year (4-digit) | 2012 |
| Separators | `-`, `/`, `,`, space | 09/01/1990 |

**Supported patterns**: `dd/LL/yyyy`, `LL/dd/yyyy`, `LLL dd yyyy`, `LLL dd, yyyy`, `dd LLL, yyyy`.

### Format scope

- **Visualization-level** (local): Per-report, set in FORMAT section
- **Data Modeling-level** (global): Reused across all reports using that field

### Conditional formatting (Data Table, Pivot Table)

- **Single Color Mode**: Highlights cells meeting a condition
- **Color Scale Mode**: Gradient based on value range (Min point + Max point required, Midpoint optional)

---

## 8. Custom Charts (Vega-Lite integration)

### Complete CustomChart structure

```aml
CustomChart {
  // FIELD DEFINITIONS
  fields {
    field a {
      type: "dimension"          // "dimension" | "measure"
      label: "Category"          // display name
      sort { apply_order: 1, direction: "asc" }
      data_type: "string"        // "string"|"number"|"boolean"|"date" (optional filter)
    }
    field b {
      type: "measure"
      label: "Value"
    }
  }

  // OPTION DEFINITIONS (appear in Styles tab)
  options {
    option tooltip {
      type: 'toggle'             // input|number-input|toggle|radio|select|color-picker
      label: 'Show tooltip'
      default_value: true
    }
    option bar_color {
      type: 'color-picker'
      label: 'Bar Color'
      default_value: '#4C78A8'
    }
    option chart_mode {
      type: 'select'
      label: 'Chart Mode'
      options: ['standard', 'stacked', 'grouped']
      default_value: 'standard'
    }
  }

  // VEGA-LITE TEMPLATE
  template: @vgl {
    "data": { "values": @{values} },
    "mark": {
      "type": "bar",
      "tooltip": @{options.tooltip.value},
      "color": @{options.bar_color.value}
    },
    "encoding": {
      "x": {
        "field": @{fields.a.name},
        "type": "nominal",
        "axis": {
          "format": @{fields.a.format},
          "formatType": "holisticsFormat"
        }
      },
      "y": {
        "field": @{fields.b.name},
        "type": "quantitative",
        "axis": {
          "format": @{fields.b.format},
          "formatType": "holisticsFormat"
        }
      }
    }
  };;
}
```

### String interpolation in templates

| Syntax | Returns |
|--------|---------|
| `@{values}` | Dataset data |
| `@{fields.<name>.name}` | Field name (quoted) |
| `@{fields.<name>.type}` | Field data type |
| `@{fields.<name>.format}` | Field format |
| `@{fields.<name>.name \| raw}` | Field name (unquoted, for expressions) |
| `@{options.<name>.value}` | Option's current value |

### holisticsConfig for interactivity

```json
"params": [
  {"name": "normalPointSelection", "select": "point"},
  {"name": "intervalSelection", "select": {"type": "interval", "encodings": ["x"]}},
  {"name": "hoverSelection", "select": {"type": "point", "on": "mouseover"}}
],
"holisticsConfig": {
  "crossFilterSignals": ["normalPointSelection", "intervalSelection"],
  "contextMenuSignals": ["hoverSelection"]
}
```

**crossFilterSignals**: Maps point/interval selections to Cross Filter.
**contextMenuSignals**: Maps hover selections to Context Menu (Explore, Date-drill, Drill-through).

### Custom Chart Library templates (available on GitHub)

Sankey Chart, Histogram, Bar+Average Line, Bar+Running Average, Box Plot, Bubble Plot, Candlestick, Error Bar, Packed Bubble, Table Heatmap, Treemap, Trellis Chart, Waterfall Chart, Calendar Heatmap, Custom Gauge, Linear Regression, Relative Frequency Histogram, Stacked Bar Sort by Size.

**Only Admins** can create CustomChart definitions; once created, available to all organization users.

---

## 9. AML reusability patterns for dashboards

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

## 10. Dashboard settings and delivery

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

## 11. Cross-filtering support matrix

| Chart Family | Supported Types |
|-------------|----------------|
| Table family | DataTable, PivotTable |
| Line chart family | Line, Bar, Column, Area, Combination |
| Pie chart family | Pie, Funnel, Pyramid |
| Scatter chart family | Scatter, Bubble |
| Custom Charts | With `holisticsConfig.crossFilterSignals` setup |

---

## 12. Best practices for dashboard design

**User-first design**: Consider who uses the dashboard and their goals before building. Match color palette to organizational branding.

**Information hierarchy**: Most important data in **top-left** (prime real estate). Supporting details and trends below. Data tables and specifics at the bottom.

**Three-level approach**: Level 1 = high-level KPIs and trendlines (optimize filters for drill-through). Level 2 = detailed breakdowns via drill-through. Level 3 = action-driven with data alerts.

**Chart selection guidance**: Use Column/Bar for category comparison. Line/Area for trends over time. Pie only for **few categories with large differences**. Combination for mixed scales. Scatter for correlations. Tables for raw data inspection.

**Formatting rules**: Never exceed 3–4 numerals (use abbreviations like 5.2M). Don't mix precision levels or big/small measures on same scale. Use Combination Chart with dual axes for different-scale measures.

**Performance**: Maximum **10–15 widgets per dashboard**. Break large dashboards into multiple with drill-through navigation. Disable auto-run for heavy dashboards. Use caching strategically.

### Key limits

| Constraint | Value |
|-----------|-------|
| Max columns in Legend/Pivot Column | **100** |
| Recommended max widgets per dashboard | **10–15** |
| Google Sheets export max rows | **15,000** |
| Supported currencies | **28** |
| Custom chart definitions | **Admins only** |
| Mass filter input | **2,000 values** |

---

## 13. Complete VizBlock field reference syntax

### Standard field reference

```aml
r(model_name.field_name)           // standard
ref('model_name', 'field_name')    // legacy alternative
```

### VizFieldFull (detailed field config)

```aml
x_axis: VizFieldFull {
  ref: r(orders.created_month)
  transformation: 'datetrunc month'
  format { type: 'date' }
}

y_axis {
  series {
    field: VizFieldFull {
      ref: r(orders.total_revenue)
      aggregation: 'sum'
      format { type: 'number' }
    }
  }
}

legend: VizFieldFull {
  ref: r(products.category)
  format { type: 'text' }
}
```

### Calculation fields (AQL-based)

```aml
calculation calc_name {
  label: 'Calculated Field'
  formula: @aql sum(orders.revenue);;
  calc_type: 'measure'       // 'measure' or 'dimension'
  data_type: 'number'        // 'number', 'text', 'date'
}
```

### AQL functions for advanced metrics

| Function | Purpose |
|----------|---------|
| `of_all()` | Calculation LoD lower than visualization (percent of total) |
| `dimensionalize()` | Turn metric into a dimension |
| `relative_period()` | Period-over-period comparison |
| `is_at_level()` | Conditional behavior based on active dimensions |
| `date_diff()` | Date difference calculation |
| `datetrunc` | Date truncation to granularity |

---

This reference covers every visualization type, every configuration parameter, every AML syntax pattern, and every dashboard construct documented in Holistics 4.0. Use it as the definitive skill reference for programmatically building visualizations and dashboards in Holistics through both the visual editor and AML code.