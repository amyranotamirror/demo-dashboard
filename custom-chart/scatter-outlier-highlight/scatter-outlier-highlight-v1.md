# Scatter Plot — Outlier Highlight

**Version:** v1
**Preview:** open `scatter-outlier-highlight-v1.html` in a browser to see all variants rendered side by side.

---

## Problem

When a scatter plot contains extreme outliers, the axis scale is forced to zoom out to fit them. This makes all the normal cluster points tiny and nearly invisible — users can only see them by hovering. The goal of these variants is to make outliers visually prominent so both the clusters and the extremes are readable at the same time.

---

## Built-in / Community Alternative

Holistics' native **ScatterChart** can display this data, but it applies a uniform style to all points — there is no built-in way to visually distinguish outliers from normal points. Use a custom chart when you need automatic or flag-based outlier highlighting.

---

## Data fields

| Field | Type | Description |
|---|---|---|
| `x_axis` | measure | X-axis value |
| `y_axis` | measure | Y-axis value |
| `group` | dimension | Group or cluster label |
| `is_outlier` | dimension (boolean) | Flag for outliers — required for Variants 1–3, not needed for Variant 4 |

---

## Variant comparison

| | Variant 1 | Variant 2 | Variant 3 | Variant 4 |
|---|---|---|---|---|
| **Approach** | Color + size + shape change | Hollow ring drawn around outlier | Always-visible floating label | Auto Z-score detection |
| **Requires** | `is_outlier` boolean field | `is_outlier` boolean field | `is_outlier` boolean field | No flag field needed |
| **Best for** | Simple, clean callout when outliers are few and pre-labeled | Preserving existing color encoding while annotating extremes | Identifying *which* group is the outlier without hovering | Exploratory analysis where outlier threshold may change |
| **Complexity** | Low | Low | Low | Medium |
| **Recommended** | — | — | — | ⭐ Yes |

---

## Variants

### Variant 1 — Color + Size + Shape

**Requires:** `is_outlier` field in the dataset.

Outliers are rendered as large red diamonds; normal points are small blue circles. This is the simplest approach — three encoding channels changed at once (color, size, shape) make outliers unmistakable even at a glance.

**Configurable options:**
- Normal point color (default: `#4c78a8`)
- Outlier point color (default: `#e45c5c`)
- Normal point size (default: `60`)
- Outlier point size (default: `250`)

```aml
CustomChart {
  fields {
    field x_axis     { type: "dimension"; label: "X Axis";  data_type: "number" }
    field y_axis     { type: "dimension"; label: "Y Axis";  data_type: "number" }
    field group      { type: "dimension"; label: "Group" }
    field is_outlier { type: "dimension"; label: "Is Outlier (true/false)"; data_type: "boolean" }
  }
  options {
    option normal_color  { type: "color-picker";  label: "Normal Point Color";  default_value: "#4c78a8" }
    option outlier_color { type: "color-picker";  label: "Outlier Point Color"; default_value: "#e45c5c" }
    option normal_size   { type: "number-input";  label: "Normal Point Size";   default_value: 60 }
    option outlier_size  { type: "number-input";  label: "Outlier Point Size";  default_value: 250 }
  }
  template: @vgl {
    "data": {"values": @{values}},
    "mark": {"type": "point", "filled": true, "tooltip": true},
    "encoding": {
      "x": {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X"},
      "y": {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y"},
      "color": {
        "condition": {
          "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
          "value": @{options.outlier_color.value}
        },
        "value": @{options.normal_color.value}
      },
      "size": {
        "condition": {
          "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
          "value": @{options.outlier_size.value}
        },
        "value": @{options.normal_size.value}
      },
      "shape": {
        "condition": {
          "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
          "value": "diamond"
        },
        "value": "circle"
      },
      "opacity": {
        "condition": {
          "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
          "value": 1
        },
        "value": 0.7
      }
    }
  };;
}
```

---

### Variant 2 — Group Colors + Shape + Halo + Hover

**Requires:** `is_outlier` field in the dataset.

Each group gets a distinct color **and shape** from the Vega scheme. Three states:
- **Default** — small dim dot (30% opacity)
- **Hover** — solid dot, slightly bigger, white border, soft dim halo circle behind it
- **Outlier** — same as hover state but always active (no interaction needed)

The halo is a dim filled circle (not a hollow ring) — always circular regardless of the point shape. Color comes from the group scheme automatically.

**Configurable options:**
- Color scheme — any Vega scheme name: `tableau10`, `set2`, `dark2`, `accent`, `paired` (default: `tableau10`)

```aml
CustomChart {
  fields {
    field x_axis     { type: "dimension"; label: "X Axis";  data_type: "number" }
    field y_axis     { type: "dimension"; label: "Y Axis";  data_type: "number" }
    field group      { type: "dimension"; label: "Group" }
    field is_outlier { type: "dimension"; label: "Is Outlier (true/false)"; data_type: "boolean" }
  }
  options {
    option color_scheme { type: "input"; label: "Color Scheme (tableau10, set2, dark2, accent…)"; default_value: "tableau10" }
  }
  template: @vgl {
    "data": {"values": @{values}},
    "transform": [
      {"calculate": "'Cross-filter other charts'", "as": "_tip_click"},
      {"calculate": "'Date drill, Drill-through'", "as": "_tip_right"}
    ],
    "layer": [
      {
        "mark": {"type": "rule", "color": "#cccccc", "strokeWidth": 1},
        "encoding": {
          "x": {"field": @{fields.x_axis.name}, "type": "quantitative"},
          "opacity": {
            "condition": {"param": "_hover", "empty": false, "value": 0.7},
            "value": 0
          }
        }
      },
      {
        "mark": {"type": "circle", "strokeOpacity": 0},
        "encoding": {
          "x": {"field": @{fields.x_axis.name}, "type": "quantitative"},
          "y": {"field": @{fields.y_axis.name}, "type": "quantitative"},
          "color": {
            "field": @{fields.group.name},
            "type": "nominal",
            "scale": {"scheme": @{options.color_scheme.value}}
          },
          "size": {"value": 500},
          "opacity": {
            "condition": [
              {
                "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
                "value": 0.18
              },
              {"param": "_hover", "empty": false, "value": 0.18}
            ],
            "value": 0
          }
        }
      },
      {
        "params": [
          {"name": "_hover", "select": {"type": "point", "on": "mouseover", "nearest": true, "clear": "mouseout"}}
        ],
        "mark": {"type": "point", "filled": true},
        "encoding": {
          "x": {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X Axis"},
          "y": {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y Axis"},
          "color": {
            "field": @{fields.group.name},
            "type": "nominal",
            "scale": {"scheme": @{options.color_scheme.value}},
            "legend": {"title": "Group"}
          },
          "shape": {
            "field": @{fields.group.name},
            "type": "nominal"
          },
          "size": {
            "condition": [
              {
                "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
                "value": 160
              },
              {"param": "_hover", "empty": false, "value": 130}
            ],
            "value": 55
          },
          "stroke": {
            "condition": [
              {
                "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
                "value": "white"
              },
              {"param": "_hover", "empty": false, "value": "white"}
            ],
            "value": "transparent"
          },
          "strokeWidth": {
            "condition": [
              {
                "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
                "value": 1.5
              },
              {"param": "_hover", "empty": false, "value": 1.5}
            ],
            "value": 0
          },
          "opacity": {
            "condition": [
              {
                "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
                "value": 1
              },
              {"param": "_hover", "empty": false, "value": 1}
            ],
            "value": 0.3
          },
          "tooltip": [
            {"field": @{fields.group.name},  "type": "nominal",      "title": "Group"},
            {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X Axis",  "format": ".2f"},
            {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y Axis",  "format": ".2f"},
            {"field": "_tip_click",          "type": "nominal",      "title": "Click"},
            {"field": "_tip_right",          "type": "nominal",      "title": "Right-click"}
          ]
        }
      }
    ],
    "config": {
      "view":   {"stroke": "transparent"},
      "axis":   {"gridColor": "#eeeeee", "domain": false, "ticks": false},
      "legend": {"symbolOpacity": 1}
    }
  };;
}
```

---

### Variant 3 — Always-Visible Label

**Requires:** `is_outlier` field in the dataset.

Normal points show their tooltip only on hover. Outlier points always display their group name as a floating text label above them, with no interaction required. Best when you need to clearly identify *which* group the outlier belongs to without hovering.

**Configurable options:**
- Normal point color (default: `#4c78a8`)
- Outlier point color + label color (default: `#e45c5c`)

```aml
CustomChart {
  fields {
    field x_axis     { type: "dimension"; label: "X Axis";  data_type: "number" }
    field y_axis     { type: "dimension"; label: "Y Axis";  data_type: "number" }
    field group      { type: "dimension"; label: "Group / Label" }
    field is_outlier { type: "dimension"; label: "Is Outlier (true/false)"; data_type: "boolean" }
  }
  options {
    option point_color   { type: "color-picker"; label: "Normal Point Color";  default_value: "#4c78a8" }
    option outlier_color { type: "color-picker"; label: "Outlier Point Color"; default_value: "#e45c5c" }
  }
  template: @vgl {
    "data": {"values": @{values}},
    "layer": [
      {
        "mark": {"type": "point", "filled": true, "tooltip": true},
        "encoding": {
          "x": {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X"},
          "y": {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y"},
          "color": {
            "condition": {
              "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
              "value": @{options.outlier_color.value}
            },
            "value": @{options.point_color.value}
          },
          "size": {
            "condition": {
              "test": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]},
              "value": 180
            },
            "value": 60
          }
        }
      },
      {
        "transform": [
          {"filter": {"field": @{fields.is_outlier.name}, "oneOf": [true, "true", 1, "1"]}}
        ],
        "mark": {"type": "text", "dy": -14, "fontSize": 11, "fontWeight": "bold"},
        "encoding": {
          "x":    {"field": @{fields.x_axis.name}, "type": "quantitative"},
          "y":    {"field": @{fields.y_axis.name}, "type": "quantitative"},
          "text": {"field": @{fields.group.name},  "type": "nominal"},
          "color":{"value": @{options.outlier_color.value}}
        }
      }
    ]
  };;
}
```

---

### Variant 4 — Auto Z-Score Detection ⭐ Recommended

**No `is_outlier` field needed.**

This variant computes outliers automatically at render time using Z-score. Any point where `|Z| > threshold` on either axis is treated as an outlier. It combines the ring annotation and always-visible label from Variants 2 and 3. The threshold is user-configurable in the Holistics options panel — lower it (e.g. `1.5`) to flag more points, raise it (e.g. `3`) for only extreme outliers.

**Why Z-score?** It measures how many standard deviations a point is from the mean. A threshold of `2` flags roughly the outermost 5% of values on a normal distribution, which is a reasonable default for cluster analysis.

**Configurable options:**
- Normal point color (default: `#4c78a8`)
- Outlier highlight color — applies to point, ring, and label (default: `#e45c5c`)
- Z-score threshold (default: `2`)

```aml
CustomChart {
  fields {
    field x_axis { type: "dimension"; label: "X Axis";  data_type: "number" }
    field y_axis { type: "dimension"; label: "Y Axis";  data_type: "number" }
    field group  { type: "dimension"; label: "Group / Label" }
  }
  options {
    option normal_color  { type: "color-picker";  label: "Normal Point Color";                  default_value: "#4c78a8" }
    option outlier_color { type: "color-picker";  label: "Outlier Highlight Color";             default_value: "#e45c5c" }
    option z_threshold   { type: "number-input";  label: "Outlier Z-score Threshold (e.g. 2)"; default_value: 2 }
  }
  template: @vgl {
    "data": {"values": @{values}},
    "params": [
      {"name": "_z_threshold", "value": @{options.z_threshold.value}}
    ],
    "transform": [
      {
        "joinaggregate": [
          {"op": "mean",  "field": @{fields.x_axis.name}, "as": "_mean_x"},
          {"op": "stdev", "field": @{fields.x_axis.name}, "as": "_stdev_x"},
          {"op": "mean",  "field": @{fields.y_axis.name}, "as": "_mean_y"},
          {"op": "stdev", "field": @{fields.y_axis.name}, "as": "_stdev_y"}
        ]
      },
      {
        "calculate": "abs((datum['@{fields.x_axis.name}'] - datum._mean_x) / datum._stdev_x) > _z_threshold || abs((datum['@{fields.y_axis.name}'] - datum._mean_y) / datum._stdev_y) > _z_threshold",
        "as": "_is_outlier"
      }
    ],
    "layer": [
      {
        "mark": {"type": "point", "filled": true, "tooltip": true},
        "encoding": {
          "x": {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X"},
          "y": {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y"},
          "color": {
            "condition": {"test": "datum._is_outlier", "value": @{options.outlier_color.value}},
            "value": @{options.normal_color.value}
          },
          "size": {
            "condition": {"test": "datum._is_outlier", "value": 180},
            "value": 60
          },
          "tooltip": [
            {"field": @{fields.group.name},  "type": "nominal",      "title": "Group"},
            {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X"},
            {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y"}
          ]
        }
      },
      {
        "transform": [{"filter": "datum._is_outlier"}],
        "mark": {"type": "point", "filled": false, "strokeWidth": 2.5},
        "encoding": {
          "x":      {"field": @{fields.x_axis.name}, "type": "quantitative"},
          "y":      {"field": @{fields.y_axis.name}, "type": "quantitative"},
          "stroke": {"value": @{options.outlier_color.value}},
          "size":   {"value": 900}
        }
      },
      {
        "transform": [{"filter": "datum._is_outlier"}],
        "mark": {"type": "text", "dy": -14, "fontSize": 11, "fontWeight": "bold"},
        "encoding": {
          "x":    {"field": @{fields.x_axis.name}, "type": "quantitative"},
          "y":    {"field": @{fields.y_axis.name}, "type": "quantitative"},
          "text": {"field": @{fields.group.name},  "type": "nominal"},
          "color":{"value": @{options.outlier_color.value}}
        }
      }
    ]
  };;
}
```
