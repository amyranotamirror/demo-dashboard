PageTheme midnight_ops {
  title: "Midnight Ops"
  background {
    bg_color: "#0B0F19"
  }
  canvas {
    background {
      bg_color: "#111827"
    }
    border {
      border_radius: 6
      border_color: "#1F2937"
    }
  }
  block {
    background {
      bg_color: "#1F2937"
    }
    label {
      font_family: "JetBrains Mono, monospace"
      font_size: 13
      font_color: "#E5E7EB"
    }
    text {
      font_color: "#9CA3AF"
    }
    border {
      border_radius: 6
      border_width: 1
      border_color: "#374151"
      border_style: "solid"
    }
    padding: 12
  }
  viz {
    table {
      general {
        bg_color: "#111827"
        hover_color: "#1F2937"
        banding_color: "#1a2332"
        font_color: "#D1D5DB"
        font_family: "JetBrains Mono, monospace"
        border_color: "#374151"
        grid_color: "#1F2937"
      }
      header {
        bg_color: "#1F2937"
        font_color: "#10B981"
        font_size: 11
        font_weight: "semibold"
      }
      sub_header {
        bg_color: "#1a2332"
        font_color: "#6EE7B7"
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
      font-family: "JetBrains Mono", monospace;
      font-size: 44px;
      color: #F9FAFB;
      letter-spacing: -1px;
    }
    
    .h-kpi-metric-label {
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
      color: #9CA3AF;
      font-weight: medium;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .h-kpi-metric-diff {
      font-family: "JetBrains Mono", monospace;
    }
    
    .h-kpi-metric-diff .friendly-diff:not(.negative) {
      background: #064E3B;
      color: #6EE7B7;
      border-color: #065F46;
    }
    
    .h-kpi-metric-diff .friendly-diff.negative {
      background: #7F1D1D;
      color: #FCA5A5;
      border-color: #991B1B;
    }
    
    /* Control variables */
    .h-theme-control-block {
      /* Select */
      --h-select-bg: #1F2937;
      --h-select-text: #E5E7EB;
      --h-select-placeholder: rgb(156 163 175 / 0.6);
      --h-select-border: #374151;
      --h-select-border-hover: #4B5563;
      --h-select-border-focus: #10B981;
      --h-select-trigger-icon: #6B7280;
      /* Input */
      --h-input-bg: #1F2937;
      --h-input-disabled-bg: #111827;
      --h-input-text-color: #E5E7EB;
      --h-input-placeholder-color: rgb(156 163 175 / 0.6);
      --h-input-border: #374151;
      --h-input-border-hover: #4B5563;
      --h-input-border-focus: #10B981;
      --h-input-selection-bg: rgb(16 185 129 / 0.2);
      --h-input-trigger-icon: #6B7280;
      /* Badge */
      --h-badge-bg: #1F2937;
      --h-badge-text: #10B981;
      --h-badge-border: #374151;
      --h-badge-hover-bg: #374151;
      /* Checkbox */
      --h-checkbox-bg: #1F2937;
      --h-checkbox-hover-bg: #374151;
      --h-checkbox-border: #4B5563;
      --h-checkbox-checked-bg: #10B981;
      --h-checkbox-checked-border: #10B981;
      --h-checkbox-focus-ring: rgb(16 185 129 / 0.3);
    }
    
    
    /* Checkbox text */
    .h-checkbox {
      color: #E5E7EB;
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
      background-color: #1F2937;
      color: #10B981;
      border: 1px solid #374151;
    }
    
    /* Text styles */
    .dac-viz-block-label {
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    
    /* Pivot total row */
    .ag-floating-bottom .ag-cell {
      background-color: #374151;
    }
    .ag-floating-bottom .ag-cell:not(.h-following-span) {
      color: #10B981;
    }
    
    /* Metric sheet sparkline */
    .h-chart-cell {
      --h-table-sparkline-color: #10B981;
    }
    
    /* Chart axis labels */
    .highcharts-xaxis-labels span,
    .highcharts-yaxis-labels span {
      color: #9CA3AF !important;
    }
    /* Chart colors — may conflict with Holistics built-in chart settings. Prefer Holistics UI for better control */
    .highcharts-root {
      --chart-1: #10B981;
      --chart-2: #3B82F6;
      --chart-3: #6EE7B7;
      --chart-4: #60A5FA;
      --chart-5: #FBBF24;
      --chart-6: #F87171;
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