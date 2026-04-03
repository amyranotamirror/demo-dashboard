# Lufga Font — Setup Instructions

Lufga is a commercial geometric sans-serif by NEWTYPE. Place the font files here.

## Download

Download from: https://newtype.kr/fonts/lufga
Or search "Lufga font download" — it's available on several free font distribution sites.

## Files needed (WOFF2 + WOFF for browser support)

Place these files in this folder:

```
Lufga-ExtraLight.woff2 / .woff   (weight 200)
Lufga-Light.woff2      / .woff   (weight 300)
Lufga-Regular.woff2    / .woff   (weight 400)
Lufga-Medium.woff2     / .woff   (weight 500)
Lufga-SemiBold.woff2   / .woff   (weight 600)
Lufga-Bold.woff2       / .woff   (weight 700)
Lufga-ExtraBold.woff2  / .woff   (weight 800)
```

If your download only includes TTF/OTF files, convert them to WOFF2 at:
https://cloudconvert.com/ttf-to-woff2

## For Holistics (hosted use)

Push the font files to your GitHub repo (if public) and reference the raw URL:

```css
@font-face {
  font-family: 'Lufga';
  src: url('https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/demo-dashboard/assets/fonts/lufga/Lufga-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

Then use in your Holistics PageTheme:
```aml
custom_css: @css
  /* paste your @font-face declarations here */
  .dac-viz-block, .h-kpi-metric-kpi, .dac-ic-block { font-family: 'Lufga', 'Space Grotesk', sans-serif !important; }
;;
```
