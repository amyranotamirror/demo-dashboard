# Figma Theme

**Version:** v1
**Mode:** Preview only (Mode A)
**Preview:** open `figma-v1.html` in browser
**AML Code:** `figma-v1.aml` *(pending approval)*

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | Figma |
| Primary color | `#4D49FC` (Figma purple-blue) |
| Secondary color | `#0ACF83` (Figma green, from component icon) |
| Accent color | `#E4FF97` (Figma lime — signature section highlight) |
| Page background | `#f5f5f5` (light gray) |
| Canvas background | `#ffffff` (white) |
| Block background | `#ffffff` (white) |
| Font (heading) | Space Grotesk 700 |
| Font (body) | Inter 400/500/600 |
| Style direction | Clean, high-contrast, bold, multi-color identity |

---

## Color palette

| Token | Hex | Source | Usage |
|---|---|---|---|
| Figma Purple-Blue | `#4D49FC` | figma.com CSS | Primary — nav accent, KPI borders, block labels, chart bars |
| Figma Lime | `#E4FF97` | figma.com CSS | Section heading strips (signature technique) |
| Figma Green | `#0ACF83` | Figma icon | Positive deltas, success badges |
| Figma Red | `#F24E1E` | Figma icon | Negative deltas, danger |
| Figma Purple (icon) | `#A259FF` | Figma icon | Component icon (header decoration) |
| Figma Blue (icon) | `#1ABCFE` | Figma icon | Component icon (header decoration) |
| Black | `#000000` | figma.com | Nav background, KPI values, body text |
| Light Gray | `#f5f5f5` | figma.com | Page background, table header |
| Border | `#e5e5e5` | Derived | Block/canvas borders |

---

## Fonts

- **Heading font:** Space Grotesk 400–700 — Google Fonts (Figma uses proprietary "ABCWhytePlusVariable"; Space Grotesk is the closest open alternative)
- **Body font:** Inter 400–600 — Google Fonts
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap`

---

## Design decisions

- **Lime strip section headings**: `#E4FF97` background with `#1a2e00` text — this IS the Figma brand fingerprint, replicated exactly from their homepage section dividers
- **4-color component icon**: the 2×2 grid of `#F24E1E` / `#1ABCFE` / `#0ACF83` / `#A259FF` in the nav and header block — unmistakably Figma
- **Black nav, flat**: no gradient, no shadow — pure black like Figma's product nav
- **KPI values in black**: strong, stark, high-contrast — Figma's aesthetic is bold type on white
- **Purple-blue labels and table headers**: `#4D49FC` used for block labels and table header text (not background) — subtle brand presence
- **Square badges**: `border-radius: 4px` instead of pill shape — matches Figma's UI component style

---

## Using this theme in Holistics

1. Copy `figma-v1.aml` into your `themes.aml` file
2. Apply to a dashboard: `Dashboard my_dashboard { theme: figma }`
3. The `@import` in `custom_css` handles font loading automatically
