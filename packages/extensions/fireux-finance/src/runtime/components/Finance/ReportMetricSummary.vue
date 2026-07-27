<template>
  <section
    class="finance-report-metric-summary"
    :class="{ 'finance-report-metric-summary--compact': compact }"
  >
    <div class="finance-report-metric-summary__lead">
      <div
        v-if="summary.meta?.length"
        class="finance-report-metric-summary__meta"
      >
        <span
          v-for="(item, index) in summary.meta"
          :key="`${index}-${item}`"
        >
          {{ item }}
        </span>
      </div>
      <p>{{ summary.primary.label }}</p>
      <strong>{{ summary.primary.value }}</strong>
      <span
        v-if="summary.primary.comparison"
        class="finance-report-metric-summary__comparison"
        :class="`finance-report-metric-summary__comparison--${summary.primary.comparison.tone}`"
      >
        <b>{{ summary.primary.comparison.value }}</b>
        {{ summary.primary.comparison.label }}
      </span>
      <small v-if="summary.primary.description">
        {{ summary.primary.description }}
      </small>
    </div>

    <div
      v-if="summary.supporting?.length"
      class="finance-report-metric-summary__supporting"
    >
      <article
        v-for="(metric, index) in summary.supporting"
        :key="`${index}-${metric.label}`"
      >
        <span
          v-if="metric.icon"
          class="finance-report-metric-summary__icon"
        >
          <UIcon :name="metric.icon" aria-hidden="true" />
        </span>
        <div>
          <p>{{ metric.label }}</p>
          <strong>{{ metric.value }}</strong>
          <span
            v-if="metric.comparison"
            class="finance-report-metric-summary__comparison"
            :class="`finance-report-metric-summary__comparison--${metric.comparison.tone}`"
          >
            <b>{{ metric.comparison.value }}</b>
            {{ metric.comparison.label }}
          </span>
          <small v-if="metric.description">{{ metric.description }}</small>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  FinancialReportMetricSummaryView,
} from '../../models/report-presentation.model'

withDefaults(defineProps<{
  compact?: boolean
  summary: FinancialReportMetricSummaryView
}>(), {
  compact: false,
})
</script>

<style scoped>
.finance-report-metric-summary {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
}

.finance-report-metric-summary__lead,
.finance-report-metric-summary__supporting article {
  min-width: 0;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
}

.finance-report-metric-summary__lead {
  position: relative;
  overflow: hidden;
  padding: calc(var(--spacing) * 5);
  background:
    radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--ui-primary) 34%, transparent), transparent 38%),
    linear-gradient(145deg, color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg-elevated)), var(--ui-bg-elevated) 62%),
    var(--ui-bg-elevated);
}

.finance-report-metric-summary__lead::after {
  position: absolute;
  width: 11rem;
  height: 11rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, transparent);
  border-radius: 50%;
  content: "";
  inset: auto -4rem -6rem auto;
}

.finance-report-metric-summary__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 5);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

.finance-report-metric-summary p {
  margin: 0;
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.finance-report-metric-summary strong {
  display: block;
  margin-top: calc(var(--spacing) * 1);
  overflow-wrap: anywhere;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-2xl), 7vw, var(--text-5xl));
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
}

.finance-report-metric-summary small {
  display: block;
  margin-top: calc(var(--spacing) * 3);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.finance-report-metric-summary__comparison {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 1.5);
  width: fit-content;
  margin-top: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 1.25) calc(var(--spacing) * 2.25);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.finance-report-metric-summary__comparison b {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xs);
}

.finance-report-metric-summary__comparison--positive b {
  color: var(--ui-success);
}

.finance-report-metric-summary__comparison--negative b {
  color: var(--ui-error);
}

.finance-report-metric-summary__supporting {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
}

.finance-report-metric-summary__supporting article {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 4.5);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--ui-primary) 4%, transparent), transparent 58%),
    var(--ui-bg-elevated);
}

.finance-report-metric-summary__icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: calc(var(--ui-radius) * 2);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
}

.finance-report-metric-summary__icon svg {
  width: 1rem;
  height: 1rem;
}

.finance-report-metric-summary__supporting strong {
  font-size: clamp(var(--text-base), 3vw, var(--text-2xl));
}

.finance-report-metric-summary--compact .finance-report-metric-summary__lead {
  padding: calc(var(--spacing) * 4);
}

.finance-report-metric-summary--compact .finance-report-metric-summary__meta {
  margin-bottom: calc(var(--spacing) * 3);
}

@media (min-width: 40rem) {
  .finance-report-metric-summary:not(.finance-report-metric-summary--compact) {
    grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
  }

  .finance-report-metric-summary:not(.finance-report-metric-summary--compact)
    .finance-report-metric-summary__supporting {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 28rem) {
  .finance-report-metric-summary__supporting {
    grid-template-columns: 1fr;
  }
}
</style>
