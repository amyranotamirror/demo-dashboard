PageTheme saas_violet {
  title: "SaaS Studio"
  background {
    bg_color: "#EDE9FE"
  }
  canvas {
    background {
      bg_color: "#FAF5FF"
    }
    border {
      border_radius: 16
      border_color: "#FAF5FF"
      border_style: none
    }
  }
  block {
    background {
      bg_color: "#FFFFFF"
    }
    label {
      font_family: "Plus Jakarta Sans, sans-serif"
      font_color: "#581C87"
      font_weight: "semibold"
    }
    text {
      font_family: "Plus Jakarta Sans, sans-serif"
      font_color: "#7E22CE"
    }
    border {
      border_radius: 14
    }
    padding: 14
    shadow: "md"
  }
  viz {
    table {
      general {
        hover_color: "#F5F3FF"
        banding_color: "#FAF5FF"
        font_color: "#3B0764"
        font_size: 13
        font_family: "Plus Jakarta Sans, sans-serif"
        border_color: "#E9D5FF"
        grid_color: "#F3E8FF"
      }
      header {
        bg_color: "#F3E8FF"
        font_color: "#581C87"
        font_weight: "semibold"
      }
      sub_header {
        bg_color: "#FAF5FF"
        font_color: "#7E22CE"
      }
      sub_title {
        font_color: "#A855F7"
        font_size: 11
      }
    }
  }
  custom_css: @css
    /* KPI styles */
    .h-kpi-metric-kpi {
      font-family: "Plus Jakarta Sans", sans-serif;
      font-size: 50px;
      color: #4C1D95;
      font-weight: extrabold;
      letter-spacing: -1px;
    }
    
    .h-kpi-metric-label {
      font-family: "Plus Jakarta Sans", sans-serif;
      font-size: 16px;
      color: #7E22CE;
      font-weight: medium;
      text-transform: capitalize;
      letter-spacing: 0.5px;
    }
    
    .h-kpi-metric-diff {
      font-size: 13px;
    }
    
    .h-kpi-metric-diff .friendly-diff:not(.negative) {
      background: #F0FDF4;
      color: #15803D;
      border-color: #BBF7D0;
    }
    
    .h-kpi-metric-diff .friendly-diff.negative {
      background: #FEF2F2;
      color: #DC2626;
      border-color: #FECACA;
    }
    
    /* Control variables */
    .h-theme-control-block {
      /* Select */
      --h-select-text: #581C87;
      --h-select-border: #E9D5FF;
      --h-select-border-hover: #C084FC;
      --h-select-border-focus: #7C3AED;
      /* Input */
      --h-input-text-color: #581C87;
      --h-input-border: #E9D5FF;
      --h-input-border-hover: #C084FC;
      --h-input-border-focus: #7C3AED;
      /* Badge */
      --h-badge-bg: #FAF5FF;
      --h-badge-text: #7C3AED;
      --h-badge-border: #E9D5FF;
      --h-badge-hover-bg: #F3E8FF;
      /* Checkbox */
      --h-checkbox-checked-bg: #7C3AED;
      --h-checkbox-checked-border: #7C3AED;
    }
    
    /* Standalone controls + date filter form container */
    .dac-ic-block .hui-select-trigger,
    .dac-ic-block .h-input,
    .h-theme-control-block .h-theme-dm-filter-container .dm-filter-form {
      border-radius: 16px;
    }
    
    /* PoP operator select — left edge rounded */
    .dac-ic-block .pop-condition-select__operator-select {
      border-radius: 0;
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
    }
    /* PoP number input — no radius (middle element) */
    .dac-ic-block .pop-condition-select__offset-input {
      border-radius: 0;
    }
    /* PoP period select — right edge rounded */
    .dac-ic-block .pop-condition-select__period-select {
      border-radius: 0;
      border-top-right-radius: 16px;
      border-bottom-right-radius: 16px;
    }
    
    /* Date filter mark — synced with badge */
    .h-highlightable-input mark {
      background-color: #FAF5FF;
      color: #7C3AED;
      border: 1px solid #E9D5FF;
    }
    
    /* Pivot total row */
    .ag-floating-bottom .ag-cell {
      background-color: #F3E8FF;
    }
    .ag-floating-bottom .ag-cell:not(.h-following-span) {
      color: #581C87;
    }
    
    /* Metric sheet sparkline */
    .h-chart-cell {
      --h-table-sparkline-color: #7C3AED;
    }
    
    /* Chart axis labels */
    .highcharts-xaxis-labels span,
    .highcharts-yaxis-labels span {
      color: #7E22CE !important;
    }
    /* Chart colors — may conflict with Holistics built-in chart settings. Prefer Holistics UI for better control */
    .highcharts-root {
      --chart-1: #7C3AED;
      --chart-2: #C084FC;
      --chart-3: #A855F7;
      --chart-4: #581C87;
      --chart-5: #E9D5FF;
      --chart-6: #4C1D95;
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