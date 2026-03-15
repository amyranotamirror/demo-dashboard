# Netflix Theme

**Version:** v1
**Mode:** Preview only (Mode A)
**Preview:** open `netflix-v1.html` in browser
**AML Code:** `netflix-v1.aml` *(pending approval)*

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | Netflix |
| Primary color | `#E50914` (Netflix Red — rgb(229,9,20)) |
| Secondary color | `#46d369` (Netflix Green — used for "New" / positive) |
| Page background | `#000000` (pure black) |
| Canvas background | `#141414` (Netflix content card level) |
| Block background | `#1f1f1f` (elevated surface) |
| Font (heading) | DM Sans 700/800 |
| Font (body) | DM Sans 400/500 |
| Style direction | Dark, cinematic, bold, maximum contrast |

---

## Color palette

| Token | Hex | Source | Usage |
|---|---|---|---|
| Netflix Red | `#E50914` | netflix.com CSS (rgb 229,9,20) | ALL primary accents — KPI values, section headings, nav line, chart bars |
| Red Hover | `#c11119` | netflix.com CSS | Interactive hover states |
| Netflix Green | `#46d369` | Netflix UI | Positive deltas, success badges |
| Danger Red | `#fb4b4b` | Derived (lighter) | Negative deltas (distinct from primary red) |
| Pure Black | `#000000` | netflix.com | Page background, nav |
| Surface 1 | `#141414` | Netflix app | Canvas background |
| Surface 2 | `#1f1f1f` | Netflix app | Block cards |
| Surface 3 | `#0a0a0a` | Derived | Table header (deepest) |
| Text Primary | `#ffffff` | netflix.com | Primary content |
| Text Secondary | `rgba(255,255,255,0.70)` | netflix.com | Table text, subtitles |
| Text Muted | `rgba(255,255,255,0.42)` | netflix.com | Labels, inactive |

---

## Fonts

- **Heading font:** DM Sans 700/800 — Google Fonts (Netflix Sans is proprietary; DM Sans approximates its clean humanist character)
- **Body font:** DM Sans 400/500 — Google Fonts
- Google Fonts import: `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap`

---

## Design decisions

- **Data wears the brand**: `#E50914` Netflix Red is used for KPI values, section headings, table header text, and chart bars — red IS the content, not decoration
- **Near-zero border radius**: 4px on all blocks and canvas — matches Netflix's `0.25rem` design token, cinematic/angular feel
- **3-level depth**: `#000000` page → `#141414` canvas → `#1f1f1f` blocks — mirrors the Netflix app's elevation system
- **Cinematic red glow in header**: `radial-gradient` red orb in the header block — matches Netflix's hero section technique
- **Top border strip on header**: thin gradient line `transparent → red → transparent` across the header top — cinematic frame effect
- **Bold table header**: `#E50914` text on `#0a0a0a` background — maximum contrast, very recognizable
- **KPI card hover**: red glow shadow on hover — interactive feedback matching the Netflix product feel

---

## Using this theme in Holistics

1. Copy `netflix-v1.aml` into your `themes.aml` file
2. Apply to a dashboard: `Dashboard my_dashboard { theme: netflix }`
3. The `@import` in `custom_css` handles font loading automatically
