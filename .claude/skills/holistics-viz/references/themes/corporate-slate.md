PageTheme corporate_slate {
  title: "Corporate Slate"
  background {
    bg_color: "#E5E7EB"
  }
  canvas {
    background {
      bg_color: "#F3F4F6"
    }
    border {
      border_radius: 4
      border_color: "#D1D5DB"
    }
    shadow: "sm"
  }
  block {
    label {
      font_size: 13
      font_color: "#1F2937"
      font_weight: "semibold"
    }
    text {
      font_color: "#4B5563"
    }
  }
  viz {
    table {
      general {
        hover_color: "#F3F4F6"
        banding_color: "#F9FAFB"
        font_color: "#1F2937"
        border_color: "#D1D5DB"
        grid_color: "#E5E7EB"
      }
      header {
        bg_color: "#F3F4F6"
        font_color: "#111827"
        font_size: 11
        font_weight: "semibold"
      }
      sub_header {
        bg_color: "#F9FAFB"
        font_color: "#374151"
        font_size: 11
      }
      sub_title {
        font_color: "#6B7280"
        font_size: 11
      }
    }
  }
  custom_css: @css
    /* KPI styles */
    .h-kpi-metric-kpi {
      font-size: 44px;
      color: #111827;
    }
    
    .h-kpi-metric-label {
      font-size: 14px;
      color: #4B5563;
      font-weight: medium;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .h-kpi-metric-diff .friendly-diff:not(.negative) {
      background: #DCFCE7;
      color: #166534;
    }
    
    .h-kpi-metric-diff .friendly-diff.negative {
      background: #FEE2E2;
      color: #991B1B;
    }
    
    /* Control variables */
    .h-theme-control-block {
      /* Select */
      --h-select-text: #1F2937;
      --h-select-border: #D1D5DB;
      --h-select-border-hover: #9CA3AF;
      --h-select-border-focus: #6B7280;
      /* Input */
      --h-input-text-color: #1F2937;
      --h-input-border: #D1D5DB;
      --h-input-border-hover: #9CA3AF;
      --h-input-border-focus: #6B7280;
      /* Badge */
      --h-badge-bg: #F3F4F6;
      --h-badge-text: #374151;
      --h-badge-border: #D1D5DB;
      --h-badge-hover-bg: #E5E7EB;
      /* Checkbox */
      --h-checkbox-checked-bg: #374151;
      --h-checkbox-checked-border: #374151;
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
      background-color: #F3F4F6;
      color: #374151;
      border: 1px solid #D1D5DB;
    }
    
    /* Text styles */
    .dac-viz-block-label {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Pivot total row */
    .ag-floating-bottom .ag-cell {
      background-color: #F3F4F6;
    }
    .ag-floating-bottom .ag-cell:not(.h-following-span) {
      color: #111827;
    }
    
    /* Metric sheet sparkline */
    .h-chart-cell {
      --h-table-sparkline-color: #374151;
    }
    
    /* Chart axis labels */
    .highcharts-xaxis-labels span,
    .highcharts-yaxis-labels span {
      color: #6B7280 !important;
    }
    /* Chart colors — may conflict with Holistics built-in chart settings. Prefer Holistics UI for better control */
    .highcharts-root {
      --chart-1: #374151;
      --chart-2: #6B7280;
      --chart-3: #4B5563;
      --chart-4: #9CA3AF;
      --chart-5: #1F2937;
      --chart-6: #D1D5DB;
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