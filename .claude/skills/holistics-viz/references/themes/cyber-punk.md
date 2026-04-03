PageTheme cyberpunk_neon {
  title: "Cyberpunk Neon"
  background {
    bg_color: "#0a0015"
    bg_image: "linear-gradient(135deg, #2d004d 0%, #0a0015 40%, #330055 70%, #0a0015 100%)"
  }
  canvas {
    background {
      bg_color: "rgba(20, 0, 40, 0.9)"
    }
    border {
      border_radius: 4
      border_color: "#FF006E"
    }
    shadow: "md"
  }
  block {
    background {
      bg_color: "rgba(30, 0, 60, 0.7)"
    }
    label {
      font_family: "Orbitron, sans-serif"
      font_size: 13
      font_color: "#FF006E"
      font_weight: "bold"
    }
    text {
      font_color: "#00D9FF"
    }
    border {
      border_radius: 4
      border_width: 1
      border_color: "#3D0066"
      border_style: "solid"
    }
    padding: 12
    shadow: "sm"
  }
  viz {
    table {
      general {
        bg_color: "rgba(15, 0, 30, 0.95)"
        hover_color: "rgba(255, 0, 110, 0.15)"
        banding_color: "rgba(30, 0, 60, 0.5)"
        font_color: "#00D9FF"
        font_family: "Orbitron, sans-serif"
        border_color: "#3D0066"
        grid_color: "#2a0044"
      }
      header {
        bg_color: "#3D0066"
        font_color: "#FF006E"
        font_size: 11
        font_weight: "bold"
      }
      sub_header {
        bg_color: "#2a0044"
        font_color: "#FF69B4"
        font_size: 11
      }
      sub_title {
        font_color: "#8866AA"
        font_size: 11
      }
    }
  }
  custom_css: @css
    /* KPI styles */
    .h-kpi-metric-kpi {
      font-family: "Orbitron", sans-serif;
      color: #00D9FF;
      font-weight: extrabold;
      letter-spacing: -1px;
    }
    
    .h-kpi-metric-label {
      font-family: "Orbitron", sans-serif;
      font-size: 11px;
      color: #FF69B4;
      font-weight: semibold;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    
    .h-kpi-metric-diff .friendly-diff:not(.negative) {
      background: #002233;
      color: #00FFAA;
      border-color: #004455;
    }
    
    .h-kpi-metric-diff .friendly-diff.negative {
      background: #330011;
      color: #FF4488;
      border-color: #550022;
    }
    
    /* Control variables */
    .h-theme-control-block {
      /* Select */
      --h-select-bg: rgba(30, 0, 60, 0.8);
      --h-select-text: #00D9FF;
      --h-select-placeholder: rgba(0, 217, 255, 0.4);
      --h-select-border: #3D0066;
      --h-select-border-hover: #FF006E;
      --h-select-border-focus: #FF006E;
      --h-select-trigger-icon: #FF69B4;
      /* Input */
      --h-input-bg: rgba(30, 0, 60, 0.8);
      --h-input-text-color: #00D9FF;
      --h-input-border: #3D0066;
      --h-input-border-hover: #FF006E;
      --h-input-border-focus: #FF006E;
      /* Badge */
      --h-badge-bg: #2a0044;
      --h-badge-text: #FF006E;
      --h-badge-border: #3D0066;
      --h-badge-hover-bg: #3D0066;
      /* Checkbox */
      --h-checkbox-bg: rgba(30, 0, 60, 0.8);
      --h-checkbox-border: #3D0066;
      --h-checkbox-checked-bg: #FF006E;
      --h-checkbox-checked-border: #FF006E;
    }
    
    
    /* Checkbox text */
    .h-checkbox {
      color: #00D9FF;
    }
    
    /* Standalone controls + date filter form container */
    .dac-ic-block .hui-select-trigger,
    .dac-ic-block .h-input,
    .h-theme-control-block .h-theme-dm-filter-container .dm-filter-form {
      border-radius: 4px;
    }
    
    /* PoP operator select — left edge rounded */
    .dac-ic-block .pop-condition-select__operator-select {
      border-radius: 0;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    /* PoP number input — no radius (middle element) */
    .dac-ic-block .pop-condition-select__offset-input {
      border-radius: 0;
    }
    /* PoP period select — right edge rounded */
    .dac-ic-block .pop-condition-select__period-select {
      border-radius: 0;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    
    /* Date filter mark — synced with badge */
    .h-highlightable-input mark {
      background-color: #2a0044;
      color: #FF006E;
      border: 1px solid #3D0066;
    }
    
    /* Text styles */
    .dac-viz-block-label {
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    /* Pivot total row */
    .ag-floating-bottom .ag-cell {
      background-color: #3D0066;
    }
    .ag-floating-bottom .ag-cell:not(.h-following-span) {
      color: #00D9FF;
    }
    
    /* Metric sheet sparkline */
    .h-chart-cell {
      --h-table-sparkline-color: #FF006E;
    }
    
    /* Chart axis labels */
    .highcharts-xaxis-labels span,
    .highcharts-yaxis-labels span {
      color: #8866AA !important;
    }
    /* Chart colors — may conflict with Holistics built-in chart settings. Prefer Holistics UI for better control */
    .highcharts-root {
      --chart-1: #FF006E;
      --chart-2: #00D9FF;
      --chart-3: #FF69B4;
      --chart-4: #00FFAA;
      --chart-5: #FFD600;
      --chart-6: #AA44FF;
    }
    
    /* Column/Bar series — 6-color palette */
    .highcharts-column-series:nth-child(6n+1) path.highcharts-point {
      fill: var(--chart-1);
    }
    .highcharts-column-series:nth-child(6n+2) path.highcharts-point {
      fill: var(--chart-2);
    }
    .highcharts-column-series:nth-child(6n+3) path.highcharts-point {
      fill: var(--chart-3);
    }
    .highcharts-column-series:nth-child(6n+4) path.highcharts-point {
      fill: var(--chart-4);
    }
    .highcharts-column-series:nth-child(6n+5) path.highcharts-point {
      fill: var(--chart-5);
    }
    .highcharts-column-series:nth-child(6n+6) path.highcharts-point {
      fill: var(--chart-6);
    }
    .highcharts-bar-series:nth-child(6n+1) path.highcharts-point {
      fill: var(--chart-1);
    }
    .highcharts-bar-series:nth-child(6n+2) path.highcharts-point {
      fill: var(--chart-2);
    }
    .highcharts-bar-series:nth-child(6n+3) path.highcharts-point {
      fill: var(--chart-3);
    }
    .highcharts-bar-series:nth-child(6n+4) path.highcharts-point {
      fill: var(--chart-4);
    }
    .highcharts-bar-series:nth-child(6n+5) path.highcharts-point {
      fill: var(--chart-5);
    }
    .highcharts-bar-series:nth-child(6n+6) path.highcharts-point {
      fill: var(--chart-6);
    }
    .highcharts-pie-series path.highcharts-point:nth-child(6n+1) {
      fill: var(--chart-1);
    }
    .highcharts-pie-series path.highcharts-point:nth-child(6n+2) {
      fill: var(--chart-2);
    }
    .highcharts-pie-series path.highcharts-point:nth-child(6n+3) {
      fill: var(--chart-3);
    }
    .highcharts-pie-series path.highcharts-point:nth-child(6n+4) {
      fill: var(--chart-4);
    }
    .highcharts-pie-series path.highcharts-point:nth-child(6n+5) {
      fill: var(--chart-5);
    }
    .highcharts-pie-series path.highcharts-point:nth-child(6n+6) {
      fill: var(--chart-6);
    }
    .highcharts-series:nth-child(6n+1 of .highcharts-line-series) path.highcharts-graph {
      stroke: var(--chart-1);
    }
    .highcharts-series:nth-child(6n+2 of .highcharts-line-series) path.highcharts-graph {
      stroke: var(--chart-2);
    }
    .highcharts-series:nth-child(6n+3 of .highcharts-line-series) path.highcharts-graph {
      stroke: var(--chart-3);
    }
    .highcharts-series:nth-child(6n+4 of .highcharts-line-series) path.highcharts-graph {
      stroke: var(--chart-4);
    }
    .highcharts-series:nth-child(6n+5 of .highcharts-line-series) path.highcharts-graph {
      stroke: var(--chart-5);
    }
    .highcharts-series:nth-child(6n+6 of .highcharts-line-series) path.highcharts-graph {
      stroke: var(--chart-6);
    }
    .highcharts-legend :nth-child(6n+1 of .highcharts-legend-item) .highcharts-point {
      fill: var(--chart-1);
    }
    .highcharts-legend :nth-child(6n+2 of .highcharts-legend-item) .highcharts-point {
      fill: var(--chart-2);
    }
    .highcharts-legend :nth-child(6n+3 of .highcharts-legend-item) .highcharts-point {
      fill: var(--chart-3);
    }
    .highcharts-legend :nth-child(6n+4 of .highcharts-legend-item) .highcharts-point {
      fill: var(--chart-4);
    }
    .highcharts-legend :nth-child(6n+5 of .highcharts-legend-item) .highcharts-point {
      fill: var(--chart-5);
    }
    .highcharts-legend :nth-child(6n+6 of .highcharts-legend-item) .highcharts-point {
      fill: var(--chart-6);
    }
  ;;
}