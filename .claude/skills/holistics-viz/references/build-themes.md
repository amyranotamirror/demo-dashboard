# Holistics Theme & Styling Reference

This reference covers the complete theme system in Holistics 4.0, including the four-level theme hierarchy, PageTheme syntax, block-level overrides, and VizTheme for tables.

---

## 1. Theme Hierarchy

Holistics uses a four-level theme system where **the most specific level wins**:

**PageTheme > CanvasTheme > BlockTheme > VizTheme**

- **PageTheme**: Top-level — sets page background, default block styling, canvas styling, viz styling, and custom CSS. Applied to the entire dashboard.
- **CanvasTheme**: Scoped to a single CanvasLayout (tab). Overrides PageTheme for that canvas.
- **BlockTheme**: Scoped to a single block. Overrides Canvas and Page themes for that block.
- **VizTheme**: Scoped to the visualization inside a VizBlock (currently supports table-family charts). Overrides all higher levels for that viz.

---

## 2. Two Theme Types

- **Pre-built themes**:
  - **System themes**: Built-in themes provided by Holistics (accessed via `H.themes.name`)
  - **Custom themes**: Organization-wide reusable themes declared as constants
- **Local themes**: Ad-hoc themes defined inline per-dashboard

---

## 3. Complete PageTheme Syntax

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

### Property reference

**Background properties** (used in `background`, `canvas.background`, `block.background`):

| Property | Type | Description |
|----------|------|-------------|
| `bg_color` | String (hex/named) | Background color |
| `bg_image` | String | CSS gradient or image URL |
| `bg_repeat` | Boolean or String | `false`, `true`, `"x"`, `"y"`, `"space"`, `"round"` |
| `bg_size` | String | `"cover"`, `"contain"` |

**Border properties** (used in `canvas.border`, `block.border`):

| Property | Type | Description |
|----------|------|-------------|
| `border_radius` | Number, String, or DetailedRadius | Corner rounding (px) |
| `border_width` | Number, String, or DetailedSpacing | Border thickness (px) |
| `border_color` | String (hex/named) | Border color |
| `border_style` | String | `none`, `solid`, `dotted`, `dashed`, `inset`, `outset`, `ridge`, `groove`, `double` |

**Font properties** (used in `block.label`, `block.text`):

| Property | Type | Description |
|----------|------|-------------|
| `font_family` | String | Font name (e.g., `"Inter"`, `"Arial"`) |
| `font_size` | Number | Size in pixels |
| `font_color` | String (hex/named) | Text color |
| `font_weight` | String | `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold` |
| `font_style` | String | `normal`, `italic` |

**Other block properties**:

| Property | Type | Description |
|----------|------|-------------|
| `padding` | Number, String, or DetailedSpacing | Inner spacing (px). DetailedSpacing: `{top, left, bottom, right}` |
| `shadow` | String | `none`, `sm`, `md`, `lg` |
| `opacity` | Number | 0–1 |

---

## 4. Applying Themes

```aml
// System theme (built-in)
Dashboard my_dash { theme: H.themes.name }

// Custom reusable theme (declared as constant)
Dashboard my_dash { theme: classic_blue }

// Local theme (inline)
Dashboard my_dash { theme: PageTheme { ... } }

// Extended theme (inherit + override)
Dashboard my_dash { theme: classic_blue.extend({ ... }) }
```

The `.extend()` method lets you inherit all properties from a base theme and override only specific ones. This is the recommended pattern for creating dashboard-specific variations of a shared brand theme.

---

## 5. Block-level Overrides

Override the dashboard theme for individual blocks:

```aml
// Override block styling
block text_block: TextBlock {
  theme: BlockTheme { background { bg_color: 'transparent' } }
}

// Override viz-level table styling
block viz_block: VizBlock {
  viz: PivotTable {
    theme: VizTheme { table { general { bg_color: 'white' } } }
  }
}
```

**BlockTheme** accepts the same `label`, `text`, `border`, `background`, `padding`, `shadow`, and `opacity` properties as `PageTheme.block`.

**VizTheme** currently supports the `table` property for styling DataTable, PivotTable, MetricSheet, and CohortRetention. It accepts `general`, `header`, `sub_header`, and `sub_title` sections as shown in the PageTheme syntax above.

---

## 6. VizTheme for Tables

The table theme controls the appearance of all table-family visualizations (DataTable, PivotTable, MetricSheet, CohortRetention).

```aml
viz {
  table {
    general {
      bg_color: 'white'           // body background
      hover_color: '#C8DCF2'      // row hover highlight
      banding_color: '#EAF5FC'    // alternating row color
      font_size: 12               // body text size
      font_color: '#505D6A'       // body text color
      font_family: 'Arial'        // body font
      border_color: '#90A2B7'     // outer border color
      border_width: 1             // outer border width
      grid_color: '#90A2B7'       // cell grid line color
    }
    header {
      bg_color: '#608EC3'         // header background
      font_size: 12
      font_color: 'white'
      font_weight: 'bold'
    }
    sub_header {                  // Pivot Table sub-headers only
      bg_color: '#AECEF2'
      font_size: 12
      font_color: '#505D6A'
      font_weight: 'bold'
    }
    sub_title {                   // Metric Sheet subtitles only
      font_size: 12
      font_color: '#505D6A'
      font_weight: 'bold'
    }
  }
}
```

---

## 7. Pre-built Theme Library

Ready-to-use complete `PageTheme` definitions are in `references/themes/`. **Read the relevant file before applying or customizing a theme.**

| File | Theme name | Style |
|------|-----------|-------|
| `themes/corporate-slate.md` | `corporate_slate` | Professional light gray — neutral, clean, enterprise |
| `themes/midnight-ops.md` | `midnight_ops` | Dark mode — deep navy/charcoal, high contrast |
| `themes/purple.md` | `saas_violet` | SaaS Studio — purple/violet accent, modern |
| `themes/neo-tech.md` | `neo_matrix` | Neo Matrix — dark green terminal aesthetic |
| `themes/cyber-punk.md` | `cyberpunk_neon` | Cyberpunk Neon — vivid neon colors on dark background |

Each file contains a complete `PageTheme` block including `background`, `canvas`, `block`, `viz.table`, and `custom_css` with chart color palette and KPI/control CSS variables. To use one:

```aml
// Copy the PageTheme block from the file as a constant, then apply:
Dashboard my_dash {
  theme: corporate_slate
  // or extend: theme: corporate_slate.extend({ block { background { bg_color: '#FFF' } } })
}
```

---

### Quick example: clean modern table theme

```aml
theme: PageTheme {
  block {
    label { font_family: 'Inter'; font_size: 14; font_color: '#1A1A2E'; font_weight: 'semibold' }
    border { border_radius: 8; border_width: 1; border_color: '#E2E8F0'; border_style: 'solid' }
    background { bg_color: '#FFFFFF' }
    shadow: 'sm'
    padding: 16
  }
  viz {
    table {
      general { bg_color: 'white'; font_family: 'Inter'; font_size: 12; font_color: '#374151'; banding_color: '#F9FAFB' }
      header { bg_color: '#1E40AF'; font_color: 'white'; font_weight: 'bold' }
    }
  }
}
```
