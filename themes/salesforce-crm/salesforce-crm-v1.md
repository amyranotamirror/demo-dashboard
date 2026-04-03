# Salesforce CRM Dark — Glassmorphism Theme

**Version:** v1
**Mode:** Preview only
**Preview:** open `salesforce-crm-v1.html` in browser
**AML Code:** `salesforce-crm-v1.aml`

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | Salesforce CRM |
| Primary color | `#CCFF00` (lime green — selective accent only) |
| Secondary color | `#5B7CF8` (blue — charts, gradients) |
| Accent color | `#FF5566` (red — negative deltas) |
| Page background | `#0A0C12` |
| Canvas background | `#111520` |
| Block background | `#181D2C` (glassmorphism: `rgba(24,29,44,0.75)` with blur) |
| Font (heading) | Space Grotesk |
| Font (body) | Space Grotesk |
| Style direction | Dark, glassmorphism, SaaS, enterprise |
| Inspiration | Behance "Salesforce CRM SaaS UX/UI Design" |

---

## Color palette

| Token | Hex | Usage |
|---|---|---|
| Accent Lime | `#CCFF00` | Active tab indicator, positive deltas, CTA highlights — used selectively |
| Accent Blue | `#5B7CF8` | Chart series, gradients, secondary visual elements |
| Page BG | `#0A0C12` | Outermost page background |
| Canvas BG | `#111520` | Dashboard canvas surface |
| Block BG | `#181D2C` | Card/block surfaces (glassmorphism overlay) |
| Block Border | `rgba(255,255,255,0.07)` | Subtle white-alpha glass border |
| Canvas Border | `rgba(255,255,255,0.05)` | Canvas edge |
| Text Primary | `#F0F2FF` | KPI values, data cells, body copy |
| Text Secondary | `#8892AC` | Labels, table headers, axis ticks |
| Text Muted | `#4A5268` | Placeholders, de-emphasized metadata |
| Nav BG | `#080A10` | Top navigation bar |
| Positive | `#CCFF00` | Upward deltas, growth indicators |
| Negative | `#FF5566` | Downward deltas, risk indicators |
| Table Header BG | `#0E1220` | Table column headers |
| Table Hover | `rgba(204,255,0,0.04)` | Row hover state |
| Table Band | `rgba(0,0,0,0.20)` | Alternating row banding |

---

## Fonts

- **Heading font:** Space Grotesk — Google Fonts (closest available match to Lufga — geometric, clean, modern with retro touches)
- **Body font:** Space Grotesk
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`

---

## Signature design technique

**Glassmorphism blocks:** Each block uses `backdrop-filter: blur(20px)` with a translucent dark background (`rgba(24,29,44,0.75)`) and a white-alpha border (`rgba(255,255,255,0.07)`). This creates a frosted-glass layering effect against the deep-space page background.

**Selective lime accent:** `#CCFF00` is deliberately restrained — used only on active tab underlines, positive delta values, and one highlight per section. KPI values remain white (`#F0F2FF`) to avoid over-saturating the interface.

**Blue-purple header glow:** The header block uses `radial-gradient` glows in `#5B7CF8` and subtle `#CCFF00` to create a depth effect behind the Salesforce cloud logo.

**Canvas lime edge:** A `border-top: 1px solid rgba(204,255,0,0.10)` on `.dac-canvas` adds a faint lime highlight along the top of the dashboard canvas.

---

## Custom CSS notes

The theme defines several utility classes for use in TextBlock content:

| Class | Effect |
|---|---|
| `.sfcrm-lime` | Applies lime green `#CCFF00` to inline text |
| `.sfcrm-blue` | Applies blue `#5B7CF8` to inline text |
| `.sfcrm-section` | Section divider style: small-caps label with bottom border |

Block labels (`.dac-viz-block-label`, `.dac-ic-block-label`) are styled uppercase with `0.07em` letter-spacing to match the Behance reference design's tight, modern hierarchy.

---

## Using this theme in Holistics

1. Copy the contents of `salesforce-crm-v1.aml` into your `themes.aml` file
2. Apply to a dashboard: `Dashboard my_dashboard { theme: salesforce_crm_dark }`
3. The `@import` in `custom_css` handles Space Grotesk font loading automatically
4. To override a single block: use `block myblock: VizBlock { theme: BlockTheme { ... } }`

---

## Notes

- **Glassmorphism rendering:** `backdrop-filter` requires a non-opaque background behind the blocks for the blur to be visible. Holistics renders blocks over the canvas, so the effect works best when the canvas has a contrasting color (`#111520`) and blocks use the `rgba(24,29,44,0.75)` translucent value set via `custom_css`, not the AML `bg_color` (which does not support rgba).
- **Lime selectivity:** If the accent lime appears too dominant after applying the theme, wrap specific TextBlock elements in plain `<span>` tags without `.sfcrm-lime` — the default text color `#F0F2FF` is neutral and works as the "rest state."
- **Font fallback:** If Space Grotesk fails to load (firewall, no internet), the system-ui / sans-serif fallback maintains clean readability.
- **Potential variation:** A v2 could explore a lighter glassmorphism variant (`rgba(24,29,44,0.55)`) with a more pronounced backdrop blur for screens where the canvas background shows through clearly.
