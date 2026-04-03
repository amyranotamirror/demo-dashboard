# Holistics Chart Selection & Building Reference

This reference covers how to pick the right visualization type and configure it in Holistics 4.0 using AML. It includes all 20+ built-in chart types, Custom Charts (Vega-Lite), and Dynamic Content Blocks.

---

## 1. Chart Selection Decision Tree

**Start with the question: "What are you trying to show?"**

```
What are you trying to show?
├── Comparison across categories
│   ├── Few categories → ColumnChart
│   └── Many categories (labels would tilt) → BarChart
├── Trend over time
│   ├── Show volume/area → AreaChart
│   └── Show trajectory → LineChart
├── Mixed scales (e.g., revenue + growth %)
│   └── CombinationChart with dual Y-axes
├── Part-to-whole / proportion
│   ├── ≤5 categories, big differences → PieChart
│   └── Hierarchical stages → PyramidChart
├── Single KPI / headline number
│   ├── Just the number → MetricKpi
│   └── Progress toward goal → GaugeChart
├── Distribution / frequency
│   └── CustomChart (Histogram template from library)
├── Relationship / correlation
│   ├── Two variables → ScatterChart
│   └── Three variables (size) → BubbleChart
├── Funnel / conversion
│   ├── Multi-step journey with rates → ConversionFunnel
│   └── Simple funnel shape → FunnelChart
├── Geographic data
│   └── Map (Filled, Point, Heatmap, or Custom)
├── Multi-axis radial comparison
│   └── RadarChart
├── Text frequency
│   └── WordCloud
├── Spreadsheet-style metrics over time
│   └── MetricSheet
├── Raw data inspection
│   └── DataTable
├── Cross-tab aggregation
│   └── PivotTable
├── Cohort retention analysis
│   └── CohortRetention
├── Something not available as built-in?
│   └── CustomChart (Vega-Lite) — see §6 below
└── Narrative, cards, calendar, kanban, heatmap, branded layout?
    └── Dynamic Content Block — see §7 below
```

### Three Visualization Categories

Holistics offers three distinct ways to visualize data:

| Category | What it is | When to use |
|----------|-----------|-------------|
| **Built-in Charts** (20+ types) | Pre-built chart types with point-and-click configuration. Covers columns, bars, lines, areas, pies, scatter, bubble, funnel, radar, maps, tables, KPIs, and more. | **Default choice.** Use whenever a built-in type fits your data story. Fastest to build, best performance, full interactivity out of the box. |
| **Custom Charts** (Vega-Lite) | Define any visualization using Vega-Lite (or full Vega) JSON templates with Holistics data binding. Access 18+ pre-built templates from the Custom Chart Library on GitHub. | Use when no built-in chart fits: histograms, box plots, waterfall charts, sankey diagrams, treemaps, candlestick charts, packed bubbles, trellis/small-multiples, etc. |
| **Dynamic Content Blocks** (HTML/CSS/Markdown) | Data-driven content using HTML, CSS, and Markdown templates that auto-update with live query results. Available in Canvas Dashboards. | Use for data narratives, custom KPI cards, calendar heatmaps, kanban boards, retention heatmaps, branded layouts, or any layout that needs pixel-perfect HTML/CSS control beyond what charts provide. |

**Design rules:**
- Pie chart: only use for ≤5 categories with large, obvious differences
- BarChart over ColumnChart when there are many categories (labels tilt otherwise)
- CombinationChart when measures have different scales — never put them on the same Y-axis
- Prefer abbreviations (5.2M, 1.3K) — never show more than 4 numerals without abbreviation

---

## 2. Complete Built-in Chart Type Reference

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

## 3. Shared Chart Settings

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

## 4. Data Formatting Reference

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

**Pattern components** (order: Currency > Group Separator > Fraction > Percentage > Abbreviation):

| Component | Syntax | Example |
|-----------|--------|---------|
| Currency | `[$€]`, `[$$]` | `$54`, `1,236€` |
| Group separator | `#,###` | `586,347` |
| Fraction | `0.00` | 2 decimal places |
| Percentage | `%` (x100) or `\\%` (no multiply) | `1,234.6%` |
| Abbreviation | `,"K"`, `,,"M"`, `,,,"B"` | `0.124M` |

**28 supported currencies**: $, EUR, JPY, GBP, CNY, TRY, KRW, RUB, INR, PKR, PHP, AUD, CAD, SGD, NZD, HKD, ILS, BRL, THB, ZAR, CHF, SEK, HUF, IDR, MYR, VND, BDT.

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

## 5. Cross-filtering Support Matrix

| Chart Family | Supported Types |
|-------------|----------------|
| Table family | DataTable, PivotTable |
| Line chart family | Line, Bar, Column, Area, Combination |
| Pie chart family | Pie, Funnel, Pyramid |
| Scatter chart family | Scatter, Bubble |
| Custom Charts | With `holisticsConfig.crossFilterSignals` setup |

---

## 6. Custom Charts — Vega-Lite Integration

### What are Custom Charts?

Custom Charts let you build **any visualization** that is not available as a built-in chart type. They use **Vega-Lite**, a high-level grammar of interactive graphics built on top of Vega and D3.js. You write a Vega-Lite JSON template, bind it to Holistics data fields and style options, and the result renders as a first-class chart on your dashboard.

For cases requiring lower-level control, Custom Charts also support **full Vega syntax** (not just Vega-Lite).

### When to use Custom Charts

Use Custom Charts when:
- The built-in chart types do not cover your use case (e.g., histogram, box plot, waterfall, sankey, treemap)
- You need a highly customized visual encoding (e.g., custom color scales, layered marks, faceted small-multiples)
- You want to replicate a specific chart design from the Holistics Custom Chart Library
- You need to combine multiple mark types in ways that CombinationChart does not support

Do NOT use Custom Charts when a built-in chart type already fits — built-in charts are faster to configure and maintain.

### Complete CustomChart AML structure

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

### Holistics Custom Chart Library

The official Custom Chart Library is hosted on GitHub at **`github.com/holistics/custom-chart-library`**. It contains ready-to-use Vega-Lite templates:

| Template | Description |
|----------|-------------|
| Sankey Chart | Flow diagram showing quantities between stages |
| Histogram | Distribution of a single continuous variable |
| Box Plot | Statistical summary (median, quartiles, outliers) |
| Waterfall Chart | Cumulative effect of sequential positive/negative values |
| Candlestick Chart | Open-high-low-close financial data |
| Error Bar | Data points with uncertainty ranges |
| Bubble Plot | Scatter with size-encoded third variable |
| Packed Bubble Chart | Circles packed by size without axes |
| Table Heatmap | Grid cells colored by intensity |
| Treemap | Hierarchical data as nested rectangles |
| Trellis Chart | Small-multiples / faceted views |
| Custom Gauge Charts | Gauge-style progress indicators |
| Bar Chart with Average Line | Bars plus an average reference line |
| Bar Chart with Running Average Line | Bars plus a running average line |
| Calendar Heatmap | Day-level heatmap in a calendar grid |
| Linear Regression | Scatter with fitted regression line |
| Relative Frequency Histogram | Normalized histogram showing proportions |
| Stacked Bar Sort by Size | Stacked bars sorted by segment size |

### How to create from the library

1. Browse the Custom Chart Library on GitHub
2. Copy the template (fields, options, and Vega-Lite JSON)
3. Paste into your CustomChart definition in Holistics
4. Adjust field mappings and options to match your dataset

### How to create from scratch

1. Go to Settings > Custom Chart > "Add a Custom Chart"
2. Define **fields** (dimensions and measures your chart needs)
3. Define **options** (style toggles, color pickers, dropdowns for the Styles tab)
4. Write the **Vega-Lite template** using `@{values}`, `@{fields.*}`, and `@{options.*}` interpolation
5. Save — the chart becomes available org-wide

### Permissions and availability

- **Only Admins** can create CustomChart definitions
- Once created, the custom chart type is available to **all organization users**
- Users can then use the custom chart type just like any built-in chart when building VizBlocks

### Full interactivity support

All custom charts support:
- **Explore** (open in exploration mode)
- **Date-drill** (change time granularity)
- **Cross-filtering** (via `crossFilterSignals` in `holisticsConfig`)
- **Drill-through** (via `contextMenuSignals` in `holisticsConfig`)
- **Data alerts** (scheduled threshold alerts)
- **Scheduled reports** (email, Slack, etc.)
- **Export** (PNG, PDF, Excel, CSV)

### Tips for writing Vega-Lite templates

- Use `transform` with `calculate` to assign `@{fields.x.name}` to short aliases — this keeps your encoding cleaner and avoids repeating long interpolated field names
- Apply Vega-Lite themes via the `config` property at the top level of your template (e.g., fonts, colors, axis styles)
- Use `"formatType": "holisticsFormat"` with `"format": @{fields.x.format}` to inherit Holistics number/date formatting
- For full Vega (not Vega-Lite) templates, use `@vg` instead of `@vgl` as the template tag

---

## 7. Dynamic Content Blocks

### What are Dynamic Content Blocks?

Dynamic Content Blocks are data-driven content components that use **Markdown, HTML, and CSS** to render auto-updating visualizations and layouts. They pull live data from your Holistics queries and render it using template syntax. Available in **Canvas Dashboards** (currently in Closed Beta).

### When to use Dynamic Content Blocks

Use Dynamic Content Blocks when you need:
- **Data narratives**: Auto-generated text summaries with live numbers ("Revenue grew 23% this quarter...")
- **Custom KPI cards**: Branded cards with icons, colors, and layouts beyond what MetricKpi offers
- **Calendar heatmaps**: Day-level heatmaps in calendar grid layouts
- **Kanban boards**: Status-based card layouts
- **Retention heatmaps**: Custom-styled cohort grids
- **Branded layouts**: Pixel-perfect designs matching corporate identity
- **Custom controls**: Buttons, tabs, or navigation elements styled with HTML/CSS

Do NOT use Dynamic Content Blocks when a built-in chart or Custom Chart (Vega-Lite) already covers the visualization — those are easier to maintain and have better built-in interactivity.

### Template syntax

**Accessing data values**:
```
{{ rows[0].`Field Name` }}          // clickable, drillable value
{{ rows[0].`Field Name`.raw }}      // raw unformatted value (for calculations, conditionals)
{{ rows[0].`Field Name`.formatted }} // formatted value (respects number/date format)
```

- No suffix = clickable and drillable (interactive)
- `.raw` = unformatted raw value (use for conditionals and calculations)
- `.formatted` = formatted string (use for display when you do not need interactivity)

**Looping over rows**:
```
{% map(rows) %}
  <div class="card">
    <h3>{{ `Product Name` }}</h3>
    <p>{{ `Revenue`.formatted }}</p>
  </div>
{% end %}
```

**Interactive drill**:
```html
<h-drill row="0" value="{{ `Country`.raw }}">
  Click to drill into {{ `Country`.formatted }}
</h-drill>
```

The `<h-drill>` custom tag enables drill-through from Dynamic Content Blocks.

### Limitations

- **NO JavaScript** — only HTML and CSS are allowed (for security reasons)
- Avoid generic CSS class names that may conflict with Holistics platform styles
- Content updates automatically when the underlying query refreshes

### Template Gallery (8 pre-built templates)

| Template | Description |
|----------|-------------|
| Executive Insights | Auto-generated narrative summary of key metrics |
| Dumbbell Chart | HTML/CSS-based dumbbell/lollipop comparison chart |
| Product Cards Grid | Grid of product cards with images and metrics |
| User Profile Card | Individual user/customer profile with key stats |
| Control Buttons | Styled navigation buttons for dashboard interaction |
| Retention Heatmap | Custom-styled retention cohort grid |
| Metrics Tree | Hierarchical breakdown of a top-level metric |
| Calendar Heatmap | Day-level data rendered in a calendar grid |

---

## 8. VizBlock Field Reference Syntax

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
