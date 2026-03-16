# TFT Dark

**Version:** v1
**Preview:** open `tft-dark-v1.html` in browser
**AML Code:** `tft-dark-v1.aml`

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | TFT Analytics |
| Primary color | `#C8AA6E` |
| Secondary color | `#0BC4E3` |
| Accent color | `#F0B429` |
| Page background | `#010A13` |
| Block background | `#0D1B2E` |
| Font (heading) | Cinzel |
| Font (body) | Inter |
| Style direction | Dark luxury, fantasy game |

---

## Color palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#C8AA6E` | Gold — headings, KPI values, borders, section accents |
| Secondary | `#0BC4E3` | Hextech cyan — positive trends, success states |
| Accent | `#F0B429` | Amber gold — warnings, callouts |
| Danger | `#E33D3D` | Red — negative trends, D-tier |
| Page BG | `#010A13` | Deepest TFT dark (near-black navy) |
| Canvas BG | `#0A1428` | Dark blue canvas |
| Block BG | `#0D1B2E` | Dark blue-navy card surfaces |

---

## Fonts

- **Heading font:** Cinzel — Google Fonts (fantasy serif, ornate uppercase)
- **Body font:** Inter — system-safe sans-serif
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap`

---

## Custom CSS notes

Dark theme overrides beyond CSS variables:
- Active tab indicator: gold `#C8AA6E` (overrides hardcoded white in base)
- Top bar border-bottom: gold at 25% opacity (overrides hardcoded black)
- Filter dropdown SVG arrow: gold
- Filter `<option>` background: dark block color (browser-rendered)
- Badge colors: semi-transparent dark backgrounds with colored text (replaces light pastel defaults)
- Progress track: dark blue-navy instead of light gray
- KPI cards: subtle gold left-border accent (`3px solid rgba(200,170,110,0.4)`)
- Header background: 3-stop dark gradient (`#071020 → #0A1428 → #0D1B2E`)
- Vega-Lite vegaConfig: axis/legend colors updated to dark-theme values

---

## Using this theme in Holistics

1. Copy `tft-dark-v1.aml` contents into your `themes.aml`
2. Apply: `Dashboard my_dashboard { theme: tft_dark }`
3. The `@import` in `custom_css` handles Cinzel font loading
4. Block override example:
```aml
block hero_kpi: VizBlock {
  theme: BlockTheme {
    background { bg_color: "#0A1428" }
    border { border_color: "#C8AA6E"; border_width: 1 }
  }
}
```

---

## Notes

- The Cinzel heading font renders best for titles and KPI values; Inter keeps table/body text readable
- The gold/cyan/dark palette is intentionally game-inspired — may be too stylized for enterprise use cases
- For a softer variant: bump `--page-bg` to `#0D1117` and `--canvas-bg` to `#161B22` for a GitHub-dark feel
- Badge overrides use `rgba` backgrounds which look better on dark than the default pastel swatches
