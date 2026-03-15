# Discord Theme

**Version:** v1
**Mode:** Preview only (Mode A)
**Preview:** open `discord-v1.html` in browser
**AML Code:** `discord-v1.aml` *(pending approval)*

---

## Brand inputs

| Property | Value |
|---|---|
| Brand name | Discord |
| Primary color | `#5865F2` (Blurple) |
| Secondary color | `#57F287` (Discord Green) |
| Accent color | `#FEE75C` (Discord Yellow) |
| Danger color | `#ED4245` (Discord Red) |
| Page background | `#1E1F22` (Guild bar / darkest) |
| Canvas background | `#313338` (Main content area) |
| Block background | `#2B2D31` (Sidebar / panel level) |
| Font (heading) | Noto Sans 700/800 |
| Font (body) | Noto Sans 400/500/600 |
| Style direction | Dark, modern, playful |

---

## Color palette

| Token | Hex | Source | Usage |
|---|---|---|---|
| Blurple | `#5865F2` | discord.com/branding | Primary — nav, accents, chart bars |
| Soft Blurple | `#949CF7` | Derived (+40% lightness) | Labels, table headers |
| Green | `#57F287` | Discord brand | Success, positive deltas, online status |
| Yellow | `#FEE75C` | Discord brand | Warnings, idle status |
| Red | `#ED4245` | Discord brand | Danger, negative deltas, DND status |
| Surface 0 | `#1E1F22` | Discord app | Page background (guild bar level) |
| Surface 1 | `#2B2D31` | Discord app | Block cards (sidebar level) |
| Surface 2 | `#313338` | Discord app | Canvas (main content level) |
| Surface 3 | `#383A40` | Discord app | Elevated inputs (modal level) |
| Text Primary | `#DBDEE1` | Discord app | Body copy, values |
| Text Secondary | `#B5BAC1` | Discord app | Subtitles, channel names |
| Text Muted | `#80848E` | Discord app | Labels, inactive elements |

---

## Fonts

- **Heading font:** Noto Sans 700/800 — Google Fonts (Discord uses proprietary "gg sans"; Noto Sans is the closest open alternative)
- **Body font:** Noto Sans 400/500/600 — Google Fonts
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap`

---

## Design decisions

- **3-level dark depth**: `#1E1F22` page → `#313338` canvas → `#2B2D31` blocks — matches Discord's real elevation system
- **Blurple as the identity anchor**: used in nav, active tab underline, chart bars, section headings, KPI left border, table headers, labels
- **Soft blurple for labels**: `#949CF7` instead of full `#5865F2` — less aggressive at small sizes
- **Icon circles**: `border-radius: 50%` — matches Discord avatar style
- **Hover effect on KPI cards**: subtle lift + blurple glow — interactive feel
- **Status colors**: green/yellow/red badges directly mirror Discord's online/idle/DND indicators
- **Content**: Discord-native metrics (DAU, messages/day, servers, voice minutes, gaming categories)

---

## Using this theme in Holistics

1. Copy `discord-v1.aml` into your `themes.aml` file
2. Apply to a dashboard: `Dashboard my_dashboard { theme: discord }`
3. The `@import` in `custom_css` handles font loading automatically
