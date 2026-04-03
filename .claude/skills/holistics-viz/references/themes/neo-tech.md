PageTheme neo_matrix {
  title: "Neo Matrix"
  background {
    bg_color: "#000000"
    bg_image: "linear-gradient(180deg, #003300 0%, #000000 50%, #002200 100%)"
  }
  canvas {
    background {
      bg_color: "rgba(0, 15, 0, 0.85)"
    }
    border {
      border_color: "#0a3d0a"
    }
  }
  block {
    background {
      bg_color: "rgba(0, 30, 0, 0.6)"
    }
    label {
      font_family: "Share Tech Mono, monospace"
      font_size: 13
      font_color: "#00FF41"
      font_weight: "bold"
    }
    text {
      font_family: "Share Tech Mono, monospace"
      font_color: "#00CC33"
    }
    border {
      border_width: 1
      border_color: "#0a3d0a"
      border_style: "solid"
    }
    padding: 10
  }
  viz {
    table {
      general {
        bg_color: "rgba(0, 10, 0, 0.9)"
        hover_color: "rgba(0, 60, 0, 0.4)"
        banding_color: "rgba(0, 20, 0, 0.5)"
        font_color: "#00CC33"
        font_family: "Share Tech Mono, monospace"
        border_color: "#0a3d0a"
        grid_color: "#062d06"
      }
      header {
        bg_color: "#0a3d0a"
        font_color: "#00FF41"
        font_size: 11
        font_weight: "bold"
      }
      sub_header {
        bg_color: "#062d06"
        font_color: "#00DD33"
        font_size: 11
      }
      sub_title {
        font_color: "#008822"
        font_size: 11
      }
    }
  }
  custom_css: @css
    /* KPI styles */
    .h-kpi-metric-kpi {
      font-family: "Share Tech Mono", monospace;
      font-size: 44px;
      color: #00FF41;
      letter-spacing: -1px;
    }
    
    .h-kpi-metric-label {
      font-family: "Share Tech Mono", monospace;
      font-size: 11px;
      color: #00AA22;
      font-weight: medium;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    
    .h-kpi-metric-diff {
      font-family: "Share Tech Mono", monospace;
    }
    
    .h-kpi-metric-diff .friendly-diff:not(.negative) {
      background: #002200;
      color: #00FF41;
      border-color: #004400;
    }
    
    .h-kpi-metric-diff .friendly-diff.negative {
      background: #330000;
      color: #FF4444;
      border-color: #550000;
    }
    
    /* Control variables */
    .h-theme-control-block {
      /* Select */
      --h-select-bg: rgba(0, 20, 0, 0.8);
      --h-select-text: #00FF41;
      --h-select-placeholder: rgba(0, 200, 50, 0.4);
      --h-select-border: #0a3d0a;
      --h-select-border-hover: #00AA22;
      --h-select-border-focus: #00FF41;
      --h-select-trigger-icon: #00AA22;
      /* Input */
      --h-input-bg: rgba(0, 20, 0, 0.8);
      --h-input-text-color: #00FF41;
      --h-input-border: #0a3d0a;
      --h-input-border-hover: #00AA22;
      --h-input-border-focus: #00FF41;
      /* Badge */
      --h-badge-bg: #002200;
      --h-badge-text: #00FF41;
      --h-badge-border: #004400;
      --h-badge-hover-bg: #003300;
      /* Checkbox */
      --h-checkbox-bg: rgba(0, 20, 0, 0.8);
      --h-checkbox-border: #0a3d0a;
      --h-checkbox-checked-bg: #00AA22;
      --h-checkbox-checked-border: #00FF41;
      --h-checkbox-checkmark: #000000;
    }
    
    
    /* Checkbox text */
    .h-checkbox {
      color: #00CC33;
    }
    
    /* Standalone controls + date filter form container */
    .dac-ic-block .hui-select-trigger,
    .dac-ic-block .h-input,
    .h-theme-control-block .h-theme-dm-filter-container .dm-filter-form {
      border-radius: 0px;
    }
    
    /* PoP operator select — left edge rounded */
    .dac-ic-block .pop-condition-select__operator-select {
      border-radius: 0;
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
    }
    /* PoP number input — no radius (middle element) */
    .dac-ic-block .pop-condition-select__offset-input {
      border-radius: 0;
    }
    /* PoP period select — right edge rounded */
    .dac-ic-block .pop-condition-select__period-select {
      border-radius: 0;
      border-top-right-radius: 0px;
      border-bottom-right-radius: 0px;
    }
    
    /* Date filter mark — synced with badge */
    .h-highlightable-input mark {
      background-color: #002200;
      color: #00FF41;
      border: 1px solid #004400;
    }
    
    /* Text styles */
    .dac-viz-block-label {
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    
    /* Pivot total row */
    .ag-floating-bottom .ag-cell {
      background-color: #0a3d0a;
    }
    .ag-floating-bottom .ag-cell:not(.h-following-span) {
      color: #00FF41;
    }
    
    /* Metric sheet sparkline */
    .h-chart-cell {
      --h-table-sparkline-color: #00FF41;
    }
    
    /* Chart axis labels */
    .highcharts-xaxis-labels span,
    .highcharts-yaxis-labels span {
      color: #00CC33 !important;
    }
    /* Chart colors — may conflict with Holistics built-in chart settings. Prefer Holistics UI for better control */
    .highcharts-root {
      --chart-1: #00FF41;
      --chart-2: #00AA22;
      --chart-3: #00CC33;
      --chart-4: #00DD33;
      --chart-5: #008822;
      --chart-6: #33FF66;
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