<template>
  <section
    class="finance-report-trend"
    :class="`finance-report-trend--${size}`"
  >
    <header class="finance-report-trend__header">
      <div>
        <p>{{ trend.title }}</p>
        <small v-if="trend.description">{{ trend.description }}</small>
      </div>

      <span
        v-if="trend.comparison"
        class="finance-report-trend__comparison"
        :class="`finance-report-trend__comparison--${trend.comparison.tone}`"
      >
        <strong>{{ trend.comparison.value }}</strong>
        {{ trend.comparison.label }}
      </span>
    </header>

    <div
      v-if="trend.series"
      class="finance-report-trend__legend"
      aria-label="Chart series"
    >
      <span>
        <i class="finance-report-trend__legend-primary" />
        {{ trend.series.primaryLabel }}
      </span>
      <span v-if="trend.series.comparisonLabel && comparisonPlotPoints.length">
        <i class="finance-report-trend__legend-comparison" />
        {{ trend.series.comparisonLabel }}
      </span>
    </div>

    <div v-if="selectedPoint" class="finance-report-trend__selection">
      <div>
        <span>{{ selectedPoint.label }}</span>
        <strong>{{ selectedPoint.valueLabel }}</strong>
        <small v-if="selectedPoint.secondaryLabel">
          {{ selectedPoint.secondaryLabel }}
        </small>
      </div>
      <div
        v-if="selectedComparisonPoint"
        class="finance-report-trend__selection-comparison"
      >
        <span>{{ trend.series?.comparisonLabel || 'Comparison' }}</span>
        <strong>{{ selectedComparisonPoint.valueLabel }}</strong>
        <small v-if="selectedComparisonPoint.secondaryLabel">
          {{ selectedComparisonPoint.secondaryLabel }}
        </small>
      </div>
    </div>

    <svg
      v-if="plotPoints.length"
      class="finance-report-trend__chart"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      role="img"
      :aria-label="trend.title"
    >
      <defs>
        <linearGradient
          :id="gradientId"
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0%" stop-color="var(--ui-primary)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--ui-primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <line
        v-for="lineY in gridLines"
        :key="lineY"
        class="finance-report-trend__grid"
        :x1="chartPaddingX"
        :x2="chartWidth - chartPaddingX"
        :y1="lineY"
        :y2="lineY"
      />

      <path
        class="finance-report-trend__area"
        :d="areaPath"
        :fill="`url(#${gradientId})`"
      />
      <path
        v-if="comparisonLinePath"
        class="finance-report-trend__line finance-report-trend__line--comparison"
        :d="comparisonLinePath"
      />
      <path class="finance-report-trend__line" :d="linePath" />

      <line
        v-if="activePlotPoint"
        class="finance-report-trend__active-guide"
        :x1="activePlotPoint.x"
        :x2="activePlotPoint.x"
        :y1="chartPaddingTop"
        :y2="baselineY"
      />

      <g
        v-for="point in comparisonPlotPoints"
        :key="`comparison-${point.id}`"
        class="finance-report-trend__comparison-point"
      >
        <circle :cx="point.x" :cy="point.y" r="2.5" />
      </g>

      <g
        v-for="(point, index) in plotPoints"
        :key="point.id"
        class="finance-report-trend__point"
        tabindex="0"
        :aria-label="`${point.label}: ${point.valueLabel}`"
        @focus="activeIndex = index"
        @mouseenter="activeIndex = index"
      >
        <circle
          :cx="point.x"
          :cy="point.y"
          r="12"
          fill="transparent"
        />
        <circle
          :cx="point.x"
          :cy="point.y"
          :r="index === activeIndex ? 5 : 3"
        />
      </g>

    </svg>

    <div
      v-if="axisPoints.length"
      class="finance-report-trend__axis"
      aria-hidden="true"
    >
      <span
        v-for="axisPoint in axisPoints"
        :key="axisPoint.id"
      >
        {{ axisPoint.label }}
      </span>
    </div>

    <div
      v-if="trend.insights?.length"
      class="finance-report-trend__insights"
    >
      <article
        v-for="(insight, index) in trend.insights"
        :key="`${index}-${insight.label}`"
      >
        <p>{{ insight.label }}</p>
        <strong>{{ insight.value }}</strong>
        <small v-if="insight.description">{{ insight.description }}</small>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import type {
  FinancialReportTrendView,
} from '../../models/report-presentation.model'

const props = withDefaults(defineProps<{
  size?: 'md' | 'lg'
  trend: FinancialReportTrendView
}>(), {
  size: 'md',
})

const chartWidth = 640
const chartHeight = 220
const chartPaddingX = 12
const chartPaddingTop = 16
const chartPaddingBottom = 8
const baselineY = chartHeight - chartPaddingBottom
const gradientId = `finance-trend-${useId().replaceAll(':', '')}`
const activeIndex = ref(Math.max(0, props.trend.points.length - 1))

const maxValue = computed(() =>
  Math.max(
    1,
    ...props.trend.points.map(point => point.value),
    ...(props.trend.comparisonPoints ?? []).map(point => point.value)
  )
)
const plotPoints = computed(() =>
  projectPoints(props.trend.points, maxValue.value)
)
const comparisonPlotPoints = computed(() =>
  projectPoints(props.trend.comparisonPoints ?? [], maxValue.value)
)

function projectPoints(
  points: FinancialReportTrendView['points'],
  maximum: number
) {
  const plotHeight = baselineY - chartPaddingTop
  const denominator = Math.max(1, points.length - 1)

  return points.map((point, index) => ({
    ...point,
    x:
      chartPaddingX
      + index * (chartWidth - chartPaddingX * 2) / denominator,
    y: chartPaddingTop + (1 - point.value / maximum) * plotHeight,
  }))
}

const linePath = computed(() => smoothPath(plotPoints.value))
const comparisonLinePath = computed(() =>
  smoothPath(comparisonPlotPoints.value)
)
const areaPath = computed(() => {
  const points = plotPoints.value
  if (!points.length) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return [
    `M ${first.x.toFixed(2)} ${baselineY}`,
    `L ${first.x.toFixed(2)} ${first.y.toFixed(2)}`,
    smoothPath(points, true),
    `L ${last.x.toFixed(2)} ${baselineY}`,
    'Z',
  ].join(' ')
})
const gridLines = [
  chartPaddingTop,
  chartPaddingTop + (baselineY - chartPaddingTop) / 2,
  baselineY,
]
const selectedPoint = computed(() =>
  props.trend.points[
    Math.min(activeIndex.value, props.trend.points.length - 1)
  ] ?? null
)
const selectedComparisonPoint = computed(() => {
  const points = props.trend.comparisonPoints ?? []
  return points[
    Math.min(activeIndex.value, points.length - 1)
  ] ?? null
})
const activePlotPoint = computed(() =>
  plotPoints.value[
    Math.min(activeIndex.value, plotPoints.value.length - 1)
  ] ?? null
)
const axisPoints = computed(() => {
  const points = plotPoints.value
  if (!points.length) return []
  const indexes = [...new Set([
    0,
    Math.floor((points.length - 1) / 2),
    points.length - 1,
  ])]
  return indexes.map(index => points[index])
})

watch(
  () => props.trend.points.length,
  length => {
    activeIndex.value = Math.max(0, length - 1)
  }
)

function smoothPath(
  points: readonly { x: number; y: number }[],
  omitMove = false
) {
  if (!points.length) return ''
  if (points.length === 1) {
    return omitMove
      ? ''
      : `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  }
  const commands = omitMove
    ? []
    : [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`]
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const midpoint = (previous.x + current.x) / 2
    commands.push(
      `C ${midpoint.toFixed(2)} ${previous.y.toFixed(2)}, `
      + `${midpoint.toFixed(2)} ${current.y.toFixed(2)}, `
      + `${current.x.toFixed(2)} ${current.y.toFixed(2)}`
    )
  }
  return commands.join(' ')
}
</script>

<style scoped>
.finance-report-trend {
  min-width: 0;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
}

.finance-report-trend__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.finance-report-trend p,
.finance-report-trend small {
  margin: 0;
}

.finance-report-trend p {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extrabold);
}

.finance-report-trend small {
  display: block;
  margin-top: calc(var(--spacing) * 1);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.finance-report-trend__comparison {
  padding: calc(var(--spacing) * 1.5) calc(var(--spacing) * 2.5);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.finance-report-trend__comparison strong {
  margin-right: calc(var(--spacing) * 1);
  color: var(--ui-text-highlighted);
}

.finance-report-trend__comparison--positive strong {
  color: var(--ui-success);
}

.finance-report-trend__comparison--negative strong {
  color: var(--ui-error);
}

.finance-report-trend__legend {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 4);
  margin-top: calc(var(--spacing) * 4);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.finance-report-trend__legend span {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.finance-report-trend__legend i {
  width: 1.5rem;
  height: 0;
  border-top: 2px solid var(--ui-primary);
}

.finance-report-trend__legend-comparison {
  border-top-style: dashed !important;
  border-color: var(--ui-text-muted) !important;
}

.finance-report-trend__selection {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  min-height: 2.4rem;
  margin-top: calc(var(--spacing) * 4);
}

.finance-report-trend__selection > div {
  min-width: 0;
}

.finance-report-trend__selection span {
  display: block;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.finance-report-trend__selection strong {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  letter-spacing: var(--tracking-tight);
}

.finance-report-trend__selection small {
  margin: 0;
}

.finance-report-trend__selection-comparison {
  padding-left: calc(var(--spacing) * 4);
  border-left: 1px solid var(--ui-border);
  text-align: right;
}

.finance-report-trend__selection-comparison strong {
  color: var(--ui-text-toned);
  font-size: var(--text-base);
}

.finance-report-trend__chart {
  display: block;
  width: 100%;
  min-height: 10rem;
  margin-top: calc(var(--spacing) * 2);
  overflow: visible;
  border-radius: calc(var(--ui-radius) * 3);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--ui-primary) 4%, transparent), transparent 55%);
}

.finance-report-trend__grid {
  stroke: var(--ui-border);
  stroke-dasharray: 4 8;
  stroke-width: 1;
}

.finance-report-trend__line {
  fill: none;
  stroke: var(--ui-primary);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.finance-report-trend__line--comparison {
  stroke: var(--ui-text-muted);
  stroke-dasharray: 7 9;
  stroke-width: 2;
  opacity: 0.72;
}

.finance-report-trend__area {
  opacity: 1;
}

.finance-report-trend__active-guide {
  stroke: color-mix(in srgb, var(--ui-primary) 48%, transparent);
  stroke-dasharray: 3 6;
  stroke-width: 1;
}

.finance-report-trend__comparison-point circle {
  fill: var(--ui-bg-elevated);
  stroke: var(--ui-text-muted);
  stroke-width: 2;
}

.finance-report-trend__point {
  cursor: default;
  outline: none;
}

.finance-report-trend__point circle:last-child {
  fill: var(--ui-bg-elevated);
  stroke: var(--ui-primary);
  stroke-width: 3;
  transition: r 140ms ease;
}

.finance-report-trend__point:focus circle:last-child {
  stroke-width: 5;
}

.finance-report-trend__axis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * -1);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.finance-report-trend__axis span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.finance-report-trend__axis span:nth-child(2) {
  text-align: center;
}

.finance-report-trend__axis span:last-child {
  text-align: right;
}

.finance-report-trend__axis span:first-child {
  text-align: left;
}

.finance-report-trend__insights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 3);
}

.finance-report-trend__insights article {
  min-width: 0;
  padding-top: calc(var(--spacing) * 3);
  border-top: 1px solid var(--ui-border);
}

.finance-report-trend__insights strong {
  display: block;
  margin-top: calc(var(--spacing) * 1);
  overflow-wrap: anywhere;
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
}

.finance-report-trend--lg {
  padding: calc(var(--spacing) * 5);
}

.finance-report-trend--lg .finance-report-trend__header p {
  font-size: var(--text-base);
}

.finance-report-trend--lg .finance-report-trend__selection strong {
  font-size: var(--text-2xl);
}

.finance-report-trend--lg .finance-report-trend__chart {
  min-height: 14rem;
}

.finance-report-trend--lg .finance-report-trend__insights strong {
  font-size: var(--text-lg);
}

@media (min-width: 40rem) {
  .finance-report-trend {
    padding: calc(var(--spacing) * 5);
  }

  .finance-report-trend--lg {
    padding: calc(var(--spacing) * 6);
  }

  .finance-report-trend--lg .finance-report-trend__chart {
    min-height: 18rem;
  }
}
</style>
