# Anthropic Theme

**Version:** v1
**Mode:** Preview only (Mode A)
**Preview:** open `anthropic-v1.html` in browser
**AML Code:** `anthropic-v1.aml` *(pending approval)*

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | Anthropic |
| Primary color | `#d97757` (coral/terracotta) |
| Secondary color | `#2d8653` (neutral green) |
| Page background | `#f0ece4` (warm cream) |
| Canvas background | `#fdfaf5` (soft warm white) |
| Block background | `#ffffff` (pure white) |
| Font (heading) | DM Sans 700/800 |
| Font (body) | DM Sans 400/500/600 |
| Style direction | Warm, minimal, technology-forward |

---

## Color palette

| Token | Hex | Source | Usage |
|---|---|---|---|
| Coral | `#d97757` | anthropic.com CSS | Primary accent — nav line, KPI values, section headings, chart bars |
| Coral Light | `#e8967a` | Derived | Hover states |
| Coral Subtle | `rgba(217,119,87,0.10)` | Derived | Badge backgrounds, table hover |
| Green | `#2d8653` | Derived | Positive deltas |
| Danger | `#c94f38` | Derived (warm red) | Negative deltas |
| Dark Slate | `#131314` | anthropic.com | Nav background, body text |
| Warm Cream | `#f0ece4` | anthropic.com | Page background |
| Warm Canvas | `#fdfaf5` | Derived | Canvas background |
| Warm Border | `#ede8e0` | Derived | Block/canvas borders |
| Text Secondary | `#6b6860` | Derived | Subtitles, table text |
| Text Muted | `#9a9590` | Derived | Labels, inactive |

---

## Fonts

- **Heading font:** DM Sans 700/800 — Google Fonts (Anthropic uses a proprietary humanist sans; DM Sans is the closest open alternative)
- **Body font:** DM Sans 400/500/600 — Google Fonts
- Google Fonts import: `https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap`

---

## Design decisions

- **Warm cream palette**: `#f0ece4` page → `#fdfaf5` canvas → `#ffffff` blocks — creates subtle warmth without being heavy
- **Coral as identity**: `#d97757` is used at the KPI value level and section headings — data wears the brand
- **Border-top on KPI cards**: 3px coral top border instead of left border — more refined, less aggressive
- **Dark nav with coral accent line**: matches Anthropic's actual website structure (dark header, warm CTA)
- **Ultra-subtle shadows**: `0 1px 4px rgba(19,19,20,0.06)` — almost imperceptible, letting the warm palette do the work
- **No harsh borders**: all borders are warm-tinted (`#ede8e0`), not neutral gray

---

## Using this theme in Holistics

1. Copy `anthropic-v1.aml` into your `themes.aml` file
2. Apply to a dashboard: `Dashboard my_dashboard { theme: anthropic }`
3. The `@import` in `custom_css` handles font loading automatically
