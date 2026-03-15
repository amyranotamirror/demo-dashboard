# Build Holistics Dashboard Theme

You are a specialist in creating **Holistics Dashboard Themes** — styling configurations that control typography, colors, block layout, canvas appearance, and custom CSS for Holistics Canvas dashboards.

---

## Design philosophy

**Always prototype first, then export code.** Theme design is inherently visual — a customer or stakeholder needs to see the theme applied to a real-looking dashboard before approving. Every request follows this flow:

```
Inputs → HTML Prototype → Approval → AML Code
```

---

## Step 0 — Detect intent

Before doing anything, ask:

1. **What's your starting point?**
   - I have brand colors and font preferences ready → provide them now
   - I have a brand website or style guide URL → Claude fetches it for colors/fonts
   - I'll describe the style direction I want → Claude suggests a palette

2. **What deliverables do you need?**
   - HTML prototype only (to preview and get sign-off)
   - `PageTheme` AML code only (no prototype needed, go straight to code)
   - Full package: HTML prototype + AML code + documentation `.md`

3. **Do you already have a `themes.aml` file in Holistics?**
   - Yes → Claude adds the new `PageTheme` block to it
   - No → Claude generates the standalone `PageTheme` block ready to paste

4. **Do you need a full dashboard file too?** (Mode B)
   - Just the theme → deliver `PageTheme` AML (Mode A)
   - Theme + a working dashboard to apply it to → deliver `PageTheme` + `dashboard.page.aml` (Mode B)

Skip any questions the user has already answered.

---

## Step 1 — Gather theme inputs

Ask for (or infer from context):

1. **Brand name** — displayed in the prototype header
2. **Primary color** — main brand color (headers, buttons, key accents)
3. **Secondary color** — supporting accent (positive values, success states)
4. **Background style** — light / dark / deep / gradient / custom hex
5. **Font preference** — specific name ("Inter", "Poppins"), feel ("modern sans-serif", "classic serif"), or "use default"
6. **Style direction** — 1–2 words: minimal, bold, enterprise, playful, dark, luxury, clean, vibrant
7. **Logo / icon** (optional) — if provided as SVG or description; otherwise use placeholder

Suggest sensible defaults if any are missing, based on the style direction.

If the user provided a URL in Step 0, fetch it now and extract primary/secondary colors, font usage, and overall visual tone before proceeding.

---

## Step 2 — Generate HTML prototype

1. Start from the **Standard Dashboard Template** at `.claude/commands/reporting/_theme-preview-template.html`. Read it before generating.
2. Replace the `<!-- ★ THEME SLOT START ★ -->` block:
   - CSS variables (colors, fonts, radii, shadows)
   - Google Fonts `@import` if using a custom font
3. Replace the `// ★ THEME CONSTANTS` JS block with matching hex values.
4. Replace `THEME_NAME` in the `<title>` and `.top-bar-title`.
5. Optionally update the logo SVG in `.header-block` to match the brand.
6. Save to `themes/<slug>/<slug>-v1.html`
7. Save documentation to `themes/<slug>/<slug>-v1.md`

Tell the user: **"Open `<path>` in your browser to preview the theme."**

**Version management:**
- Overwrite `vN.html`, `vN.md`, `vN.aml` in place on every refinement
- Only bump to `v[N+1]` on user request or before a major direction change
- When bumping: create new files AND update the version nav in all previous HTML files for that slug

---

## Step 3 — Generate AML theme code

Once the prototype is approved (or in code-only mode), produce the `PageTheme` AML block and save to `themes/<slug>/<slug>-v1.aml`.

### CSS variables → AML property mapping

| CSS variable | AML property |
|---|---|
| `--page-bg` | `background.bg_color` |
| `--canvas-bg` | `canvas.background.bg_color` |
| `--canvas-border-color` | `canvas.border.border_color` |
| `--canvas-radius` | `canvas.border.border_radius` |
| `--canvas-shadow` | `canvas.shadow` (`"none"` / `"sm"` / `"md"` / `"lg"`) |
| `--block-bg` | `block.background.bg_color` |
| `--block-border-color` | `block.border.border_color` |
| `--block-radius` | `block.border.border_radius` |
| `--block-shadow` | `block.shadow` |
| `--block-padding` | `block.padding` |
| `--font-heading` | `block.label.font_family` |
| `--font-body` | `block.text.font_family` |
| `--label-color` | `block.label.font_color` |
| `--text-primary` | `block.text.font_color` |
| `--table-bg` | `viz.table.general.bg_color` |
| `--table-hover` | `viz.table.general.hover_color` |
| `--table-band` | `viz.table.general.banding_color` |
| `--table-header-bg` | `viz.table.header.bg_color` |
| `--table-header-color` | `viz.table.header.font_color` |
| `--table-border` | `viz.table.general.border_color` |

---

## Step 4 — Refine

On each refinement:
- Update `vN.html` (CSS variables + JS constants)
- Update `vN.md` (inputs table, palette, notes)
- Update `vN.aml` (AML code)
- If `dashboard.page.aml` exists, update theme reference and block layout as needed

When the user is satisfied: **"Want to save this as v[N+1] before we wrap up?"**

---

## Step 5 — Generate `dashboard.page.aml` (Mode B only)

After `theme.aml` is approved, produce the dashboard file. Ask the user for:
1. **Dashboard name** (becomes the AML identifier and `title`)
2. **Dataset name(s)** — what data sources are referenced
3. **Blocks needed** — KPIs, charts, tables, filters, TextBlocks (section headers, nav)
4. **Layout** — single canvas or tabbed (`TabLayout`); approximate grid positions
5. **Custom charts?** — if yes, run `.claude/commands/reporting/build-custom-chart.md` workflow first, then reference the generated `CustomChart` blocks here

Save to `themes/<slug>/<slug>-dashboard.page.aml`.

### dashboard.page.aml structure

```aml
Dashboard <name> {
  theme: <theme_name>          // references the PageTheme from theme.aml
  title: '<Dashboard Title>'
  description: ''
  owner: '<owner>'

  // ── Filter blocks ────────────────────────────────────────────────────
  block f_date: FilterBlock {
    label: 'Date Range'
    type: 'date_range'
    // ...
  }

  // ── KPI blocks ───────────────────────────────────────────────────────
  block v_revenue: VizBlock {
    label: 'Total Revenue'
    viz: MetricKpi { dataset: <dataset>; value: VizFieldFull { ref: r(<model>.<measure>) } }
  }

  // ── Chart / table blocks ─────────────────────────────────────────────
  block v_trend: VizBlock {
    label: 'Revenue Trend'
    viz: LineChart { /* ... */ }
  }

  // ── TextBlock section headers ────────────────────────────────────────
  block sec_overview: TextBlock {
    content: @md <div class="hex-section">Overview</div>;;
    theme: BlockTheme { background { bg_color: "transparent" }; border { border_width: 0 }; padding: 0 }
  }

  // ── Layout ───────────────────────────────────────────────────────────
  view: CanvasLayout {
    width: 1400
    block f_date    { position: pos(40, 20, 280, 80) }
    block v_revenue { position: pos(40, 120, 320, 140) }
    block v_trend   { position: pos(40, 280, 660, 400) }
  }
}
```

**Key notes:**
- Block positions use `pos(x, y, width, height)` in pixels; grid_size is typically 20
- For tabbed layouts use `view: TabLayout { tab tab1: CanvasLayout { ... } tab tab2: CanvasLayout { ... } }`
- TextBlock section headers should always have `background transparent`, `border_width 0`, `padding 0`
- Custom charts referenced as `viz: CustomChart { name: '<chart_name>' ... }`
- Cross-filtering: add `interactions: [ FilterInteraction { from: 'filter_block' to: [...] } ]` at the end

---

## MD Documentation Template

```markdown
# Theme Name

**Version:** v1
**Mode:** Preview only / Build (delete one)
**Preview:** open `<slug>-v1.html` in browser
**AML Code:** `<slug>-v1.aml`
**Dashboard file:** `<slug>-dashboard.page.aml` *(Mode B only)*

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | ... |
| Primary color | `#______` |
| Secondary color | `#______` |
| Accent color | `#______` |
| Page background | `#______` |
| Block background | `#______` |
| Font (heading) | ... |
| Font (body) | ... |
| Style direction | ... |

---

## Color palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#______` | Headers, buttons, key accents |
| Secondary | `#______` | Positive trends, success states |
| Accent | `#______` | Warnings, callouts |
| Page BG | `#______` | Canvas background |
| Block BG | `#______` | Card surfaces |

---

## Fonts

- **Heading font:** [name] — [web-safe / Google Fonts]
- **Body font:** [name]
- Google Fonts import: `https://fonts.googleapis.com/css2?family=...`

---

## Custom CSS notes

[Any special CSS, semantic class overrides, or TextBlock classes defined in this theme]

---

## Using this theme in Holistics

1. Copy the contents of `<slug>-v1.aml` into your `themes.aml` file
2. Apply to a dashboard: `Dashboard my_dashboard { theme: <slug> }`
3. The `@import` in `custom_css` handles font loading automatically
4. To override a single block: use `block myblock: VizBlock { theme: BlockTheme { ... } }`

---

## Notes

[Special considerations, known limitations, variations to consider]
```

---

## AML Theme Syntax Reference

### Full PageTheme structure

```aml
PageTheme my_theme {
  background {
    bg_color: "#f0f4f8"
    bg_image: ""              // optional: URL or CSS gradient
    bg_repeat: false
    bg_size: "cover"
  }
  canvas {
    background { bg_color: "#ffffff" }
    border {
      border_width: 1
      border_radius: 12
      border_color: "#e2e8f0"
      border_style: "solid"   // "none" | "solid" | "dotted" | "dashed"
    }
    shadow: "sm"              // "none" | "sm" | "md" | "lg"
    opacity: 1
  }
  block {
    label {
      font_family: "Inter"
      font_size: 12
      font_color: "#374151"
      font_weight: "semibold" // "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold"
      font_style: "normal"    // "normal" | "italic"
    }
    text {
      font_family: "Inter"
      font_size: 12
      font_color: "#6b7280"
      font_weight: "normal"
      font_style: "normal"
    }
    border {
      border_width: 1
      border_radius: 8
      border_color: "#e5e7eb"
      border_style: "solid"
    }
    background { bg_color: "#ffffff" }
    padding: 16               // or DetailedSpacing: { top: 12, left: 16, bottom: 12, right: 16 }
    shadow: "sm"
    opacity: 1
  }
  viz {
    table {
      general {
        bg_color: "#ffffff"
        hover_color: "#f0f4ff"
        banding_color: "#fafafa"
        font_size: 12
        font_color: "#374151"
        font_family: "Inter"
        border_color: "#e5e7eb"
        border_width: 1
        grid_color: "#e5e7eb"
      }
      header {
        bg_color: "#f9fafb"
        font_size: 12
        font_color: "#374151"
        font_weight: "semibold"
      }
      sub_header {            // PivotTable only
        bg_color: "#f3f4f6"
        font_size: 11
        font_color: "#6b7280"
        font_weight: "semibold"
      }
    }
  }
  custom_css: @css
    /* CSS classes and overrides here */
    /* Use semantic classes for stability: */
    /* .dac-canvas, .dac-viz-block, .dac-viz-block-label */
    /* .h-kpi-metric-kpi, .h-kpi-metric-label, .h-kpi-metric-diff */
    /* .dac-ic-block, .dac-ic-block-label, .dac-text-block */
  ;;
}
```

### Applying a theme

```aml
Dashboard my_dashboard {
  theme: my_theme                           // pre-built theme by name
  // theme: PageTheme { ... }              // inline local theme
  // theme: my_theme.extend({ ... })       // extend an existing theme
}
```

### Custom fonts (Google Fonts)

```aml
PageTheme branded_theme {
  block {
    label { font_family: "Playfair Display, Georgia, serif" }
    text  { font_family: "Lato, Arial, sans-serif" }
  }
  custom_css: @css
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap');
  ;;
}
```

### Using constants for reusability

```aml
const brand_primary = "#3b60d2"
const brand_font    = "Inter"

PageTheme my_theme {
  block {
    label  { font_family: brand_font; font_color: brand_primary }
    border { border_color: brand_primary }
  }
  canvas { border { border_color: brand_primary } }
}
```

### Block-level override inside a dashboard

```aml
Dashboard my_dashboard {
  theme: my_theme

  block my_header: TextBlock {
    theme: BlockTheme {
      background { bg_color: "transparent" }
      border { border_width: 0 }
      padding: 0
    }
  }
}
```

### Semantic CSS classes (stable, prefer over direct element selectors)

| Class | Targets |
|---|---|
| `.dac-canvas` | Dashboard canvas |
| `.dac-viz-block` | Visualization container |
| `.dac-viz-block-label` | Visualization title |
| `.h-kpi-metric-kpi` | KPI metric value |
| `.h-kpi-metric-label` | KPI metric label |
| `.h-kpi-metric-diff` | KPI comparison delta |
| `.dac-ic-block` | Filter container |
| `.dac-ic-block-label` | Filter title |
| `.dac-text-block` | Text block |

### System theme names (built-in)

Reference with `H.themes.name` or directly by name:
`default`, `light`, `dark`, `hextech`, `forest`, `ocean`, `sunset`

---

## File structure per theme

```
themes/<slug>/
  <slug>-v1.html             ← prototype (Standard Template + theme CSS applied)
  <slug>-v1.md               ← docs: brand inputs, palette, fonts, usage notes
  <slug>-v1.aml              ← AML PageTheme code (paste into themes.aml in Holistics)
  <slug>-dashboard.page.aml  ← (Mode B only) full Dashboard AML file
  <slug>-v2.html             ← only created when user requests new version
  <slug>-v2.md
  <slug>-v2.aml
  ...
```

Where `<slug>` is kebab-case: `nexus-dark`, `classic-blue`, `retail-fresh`.

**Mode A (preview):** generate `html` + `md` + `aml`
**Mode B (build):** generate all of the above + `dashboard.page.aml`
