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
        <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
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
        <circle :cx="point.x" :cy="point.y" r="12" fill="transparent" />
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
      <span v-for="axisPoint in axisPoints" :key="axisPoint.id">
        {{ axisPoint.label }}
      </span>
    </div>

    <div v-if="trend.insights?.length" class="finance-report-trend__insights">
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
import type { FinancialReportTrendView } from '../../models/report-presentation.model'

const props = withDefaults(
  defineProps<{
    size?: 'md' | 'lg'
    trend: FinancialReportTrendView
  }>(),
  {
    size: 'md',
  }
)

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
    ...props.trend.points.map((point) => point.value),
    ...(props.trend.comparisonPoints ?? []).map((point) => point.value)
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
    x: chartPaddingX + (index * (chartWidth - chartPaddingX * 2)) / denominator,
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
  if (!first || !last) return ''
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
const selectedPoint = computed(
  () =>
    props.trend.points[
      Math.min(activeIndex.value, props.trend.points.length - 1)
    ] ?? null
)
const selectedComparisonPoint = computed(() => {
  const points = props.trend.comparisonPoints ?? []
  return points[Math.min(activeIndex.value, points.length - 1)] ?? null
})
const activePlotPoint = computed(
  () =>
    plotPoints.value[
      Math.min(activeIndex.value, plotPoints.value.length - 1)
    ] ?? null
)
const axisPoints = computed(() => {
  const points = plotPoints.value
  if (!points.length) return []
  const indexes = [
    ...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]),
  ]
  return indexes.flatMap((index) => {
    const point = points[index]
    return point ? [point] : []
  })
})

watch(
  () => props.trend.points.length,
  (length: number) => {
    activeIndex.value = Math.max(0, length - 1)
  }
)

function smoothPath(
  points: readonly { x: number; y: number }[],
  omitMove = false
) {
  const first = points[0]
  if (!first) return ''
  if (points.length === 1) {
    return omitMove ? '' : `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`
  }
  const commands = omitMove
    ? []
    : [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`]
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    if (!previous || !current) continue
    const midpoint = (previous.x + current.x) / 2
    commands.push(
      `C ${midpoint.toFixed(2)} ${previous.y.toFixed(2)}, ` +
        `${midpoint.toFixed(2)} ${current.y.toFixed(2)}, ` +
        `${current.x.toFixed(2)} ${current.y.toFixed(2)}`
    )
  }
  return commands.join(' ')
}
</script>

<style scoped src="./report-trend.css"></style>
