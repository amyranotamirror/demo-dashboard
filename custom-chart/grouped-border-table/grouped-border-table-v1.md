# Grouped Border Table

**Version:** v1
**Preview:** open `grouped-border-table-v1.html` in a browser to see design variants.

---

## Problem

Holistics' built-in DataTable has no way to visually group rows that share a dimension value (e.g. OS = Android / iOS) with a distinct border box. Users reviewing performance data across multiple segments need to instantly tell which rows belong to the same group — without pivoting or merging cells.

---

## Data shape — wide format (normal table)

Standard wide-format data, one row per data point. Data must be **sorted by `group_dim`** so rows from the same group arrive consecutively.

| Column | Type | Description |
|---|---|---|
| `group_dim` | dimension | Determines which rows are grouped together — rows with the same value get a shared border box |
| All other columns | dimension / measure | Any fields you want shown as table columns |

---

## AML

Declare `group_dim` first, then add one `field` entry per column you want to display. The `fold` in the template converts them to the grid layout automatically.

```aml
CustomChart {
  fields {
    field group_dim    { type: "dimension"; label: "Group By";      data_type: "string" }
    field product      { type: "dimension"; label: "Product";       data_type: "string" }
    field ll_activity  { type: "dimension"; label: "LL Activity";   data_type: "string" }
    field install_week { type: "dimension"; label: "Install Week";  data_type: "string" }
    field total_cost   { type: "dimension"; label: "Total Cost";    data_type: "string" }
    field dau_count    { type: "dimension"; label: "DAU Count";     data_type: "string" }
    field cpdau        { type: "dimension"; label: "CPDAU";         data_type: "string" }
    field d3_roi       { type: "dimension"; label: "D3 ROI (%)";    data_type: "string" }
    field cp_refd_d3   { type: "dimension"; label: "CP ReFD D3";    data_type: "string" }
    field d7_roi       { type: "dimension"; label: "D7 ROI (%)";    data_type: "string" }
  }
  template: @vgl {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {"values": @{values}},
    "transform": [
      {
        "fold": [
          @{fields.product.name},
          @{fields.ll_activity.name},
          @{fields.install_week.name},
          @{fields.total_cost.name},
          @{fields.dau_count.name},
          @{fields.cpdau.name},
          @{fields.d3_roi.name},
          @{fields.cp_refd_d3.name},
          @{fields.d7_roi.name}
        ],
        "as": ["_col", "_val"]
      }
    ],
    "facet": {
      "row": {
        "field": @{fields.group_dim.name},
        "type": "nominal",
        "title": null,
        "header": {
          "labelFontWeight": "bold",
          "labelFontSize": 12,
          "labelColor": "#2563EB",
          "labelOrient": "left",
          "labelAngle": 0,
          "labelPadding": 8
        }
      }
    },
    "spec": {
      "height": {"step": 26},
      "layer": [
        {
          "mark": {"type": "rect"},
          "encoding": {
            "x": {
              "field": "_col",
              "type": "nominal",
              "sort": null,
              "axis": {
                "orient": "top",
                "labelAngle": 0,
                "title": null,
                "labelFontWeight": "bold",
                "labelColor": "#374151"
              }
            },
            "y": {
              "field": @{fields.install_week.name},
              "type": "ordinal",
              "sort": null,
              "axis": null
            },
            "color": {"value": "#ffffff"}
          }
        },
        {
          "mark": {"type": "text", "fontSize": 11},
          "encoding": {
            "x": {
              "field": "_col",
              "type": "nominal",
              "sort": null
            },
            "y": {
              "field": @{fields.install_week.name},
              "type": "ordinal",
              "sort": null
            },
            "text": {"field": "_val"},
            "color": {"value": "#111111"}
          }
        }
      ]
    },
    "resolve": {"axis": {"x": "shared"}},
    "config": {
      "font": "Inter",
      "view": {
        "stroke": "#2563EB",
        "strokeWidth": 2,
        "fill": "#ffffff"
      },
      "facet": {"spacing": 0},
      "axis": {"grid": false, "domain": false, "ticks": false}
    }
  };;
}
```

---

## How to add or remove columns

- **Add a column:** add a `field` entry in the `fields` block, then add its `@{fields.<name>.name}` to the `fold` array in the template
- **Remove a column:** remove the `field` entry and remove it from the `fold` array
- **Reorder columns:** change the order of entries in the `fold` array (column order matches fold order since `"sort": null`)

---

## Customisation

| What | Where in template | Default |
|---|---|---|
| Group border color | `"stroke"` in config + `"labelColor"` in header | `#2563EB` (blue) |
| Gap between groups | `"spacing"` in config.facet | `0` (flush) |
| Row height | `"step"` in spec.height | `26` |
| Font size | `"fontSize"` on text mark | `11` |

---

## Sample data

See `sample-data.csv` — wide-format, sorted by `group_dim`.
