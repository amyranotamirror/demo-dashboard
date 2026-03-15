# Holistics Brand Theme

**Version:** v1
**Mode:** Preview only (Mode A)
**Preview:** open `holistics-brand-v1.html` in browser
**AML Code:** `holistics-brand-v1.aml` *(pending approval)*

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | Holistics |
| Primary color | `#1b7ce4` |
| Secondary color | `#259b6c` |
| Accent color | `#e36a01` |
| Danger color | `#e71f18` |
| Page background | `#f2f5fa` |
| Block background | `#ffffff` |
| Font (heading) | Inter 700 |
| Font (body) | Inter 400/500/600 |
| Style direction | Clean, enterprise, minimal |

---

## Color palette

| Token | Hex | Source | Usage |
|---|---|---|---|
| Primary Blue | `#1b7ce4` | `background.highlight.default` | Header, nav, accents, chart bars |
| Primary Hover | `#1663b6` | `background.highlight.hover` | Nav background |
| Primary Subtle | `#dbeeff` | Derived | Badge backgrounds, icon tints |
| Success Green | `#259b6c` | `background.success.default` | Positive deltas, active status |
| Warning Orange | `#e36a01` | `background.warning.default` | Review/caution states |
| Danger Red | `#e71f18` | `background.danger.default` | Negative deltas, at-risk status |
| Text Primary | `#212327` | `text.default` | Body copy, table cells |
| Text Strong | `#13151a` | `text.strong` | KPI values, section headings |
| Text Secondary | `#636872` | Derived | Subtitles, descriptions |
| Text Muted | `#989ca6` | `text.disabled` | Filter labels, empty states |
| Border | `#e3e7ed` | `border.default` | Card borders, table lines |
| Page BG | `#f2f5fa` | Derived | App shell background |

---

## Fonts

- **Heading font:** Inter 700 — Google Fonts
- **Body font:** Inter 400/500/600 — Google Fonts
- **Code font:** JetBrains Mono (not applied in theme, reference only)
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`

---

## Source

Colors extracted from `design.holistics.dev/base-elements/color.html` and `design.holistics.dev/base-elements/typography.html`.

---

## Using this theme in Holistics

1. Copy `holistics-brand-v1.aml` into your `themes.aml` file
2. Apply to a dashboard: `Dashboard my_dashboard { theme: holistics_brand }`
3. The `@import` in `custom_css` handles font loading automatically
