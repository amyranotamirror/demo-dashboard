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
    field x_axis     { type: "measure";   label: "X Axis" }
    field y_axis     { type: "measure";   label: "Y Axis" }
    field group      { type: "dimension"; label: "Group" }
    field is_outlier { type: "dimension"; label: "Is Outlier (true/false)"; data_type: "boolean" }
  }
  options {
    option normal_color  { type: "color";  label: "Normal Point Color";  default_value: "#4c78a8" }
    option outlier_color { type: "color";  label: "Outlier Point Color"; default_value: "#e45c5c" }
    option normal_size   { type: "number"; label: "Normal Point Size";   default_value: 60 }
    option outlier_size  { type: "number"; label: "Outlier Point Size";  default_value: 250 }
  }
  template: @vgl {
    "data": {"values": @{values}},
    "mark": {"type": "point", "filled": true, "tooltip": true},
    "encoding": {
      "x": {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X"},
      "y": {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y"},
      "color": {
        "condition": {
          "test": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'",
          "value": @{options.outlier_color.value}
        },
        "value": @{options.normal_color.value}
      },
      "size": {
        "condition": {
          "test": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'",
          "value": @{options.outlier_size.value}
        },
        "value": @{options.normal_size.value}
      },
      "shape": {
        "condition": {
          "test": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'",
          "value": "diamond"
        },
        "value": "circle"
      },
      "opacity": {
        "condition": {
          "test": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'",
          "value": 1
        },
        "value": 0.7
      }
    }
  };;
}
```

---

### Variant 2 — Hollow Ring Annotation

**Requires:** `is_outlier` field in the dataset.

All data points are rendered normally. Outliers additionally get a bold hollow ring drawn around them as a second layer. This approach doesn't distort point size or shape — ideal when the existing visual encoding (e.g. color per cluster) should be preserved and you just want to annotate the extremes.

**Configurable options:**
- Normal point color (default: `#4c78a8`)
- Outlier ring color (default: `#e45c5c`)
- Ring size (default: `900` — controls how large the circle is)

```aml
CustomChart {
  fields {
    field x_axis     { type: "measure";   label: "X Axis" }
    field y_axis     { type: "measure";   label: "Y Axis" }
    field group      { type: "dimension"; label: "Group" }
    field is_outlier { type: "dimension"; label: "Is Outlier (true/false)"; data_type: "boolean" }
  }
  options {
    option point_color { type: "color";  label: "Normal Point Color"; default_value: "#4c78a8" }
    option ring_color  { type: "color";  label: "Outlier Ring Color"; default_value: "#e45c5c" }
    option ring_size   { type: "number"; label: "Ring Size";          default_value: 900 }
  }
  template: @vgl {
    "data": {"values": @{values}},
    "layer": [
      {
        "mark": {"type": "point", "filled": true, "tooltip": true, "size": 80},
        "encoding": {
          "x": {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X"},
          "y": {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y"},
          "color": {"value": @{options.point_color.value}},
          "tooltip": [
            {"field": @{fields.group.name},  "type": "nominal",      "title": "Group"},
            {"field": @{fields.x_axis.name}, "type": "quantitative", "title": "X"},
            {"field": @{fields.y_axis.name}, "type": "quantitative", "title": "Y"}
          ]
        }
      },
      {
        "transform": [
          {"filter": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'"}
        ],
        "mark": {"type": "point", "filled": false, "strokeWidth": 2.5, "opacity": 0.85},
        "encoding": {
          "x":      {"field": @{fields.x_axis.name}, "type": "quantitative"},
          "y":      {"field": @{fields.y_axis.name}, "type": "quantitative"},
          "stroke": {"value": @{options.ring_color.value}},
          "size":   {"value": @{options.ring_size.value}}
        }
      }
    ]
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
    field x_axis     { type: "measure";   label: "X Axis" }
    field y_axis     { type: "measure";   label: "Y Axis" }
    field group      { type: "dimension"; label: "Group / Label" }
    field is_outlier { type: "dimension"; label: "Is Outlier (true/false)"; data_type: "boolean" }
  }
  options {
    option point_color   { type: "color"; label: "Normal Point Color";  default_value: "#4c78a8" }
    option outlier_color { type: "color"; label: "Outlier Point Color"; default_value: "#e45c5c" }
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
              "test": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'",
              "value": @{options.outlier_color.value}
            },
            "value": @{options.point_color.value}
          },
          "size": {
            "condition": {
              "test": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'",
              "value": 180
            },
            "value": 60
          }
        }
      },
      {
        "transform": [
          {"filter": "datum[@{fields.is_outlier.name}] == true || datum[@{fields.is_outlier.name}] == 'true'"}
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
    field x_axis { type: "measure";   label: "X Axis" }
    field y_axis { type: "measure";   label: "Y Axis" }
    field group  { type: "dimension"; label: "Group / Label" }
  }
  options {
    option normal_color  { type: "color";  label: "Normal Point Color";                  default_value: "#4c78a8" }
    option outlier_color { type: "color";  label: "Outlier Highlight Color";             default_value: "#e45c5c" }
    option z_threshold   { type: "number"; label: "Outlier Z-score Threshold (e.g. 2)"; default_value: 2 }
  }
  template: @vgl {
    "data": {"values": @{values}},
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
        "calculate": "abs((datum[@{fields.x_axis.name}] - datum._mean_x) / datum._stdev_x) > @{options.z_threshold.value} || abs((datum[@{fields.y_axis.name}] - datum._mean_y) / datum._stdev_y) > @{options.z_threshold.value}",
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
