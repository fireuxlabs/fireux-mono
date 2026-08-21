<template>
  <UCard
    as="section"
    variant="subtle"
    class="finance-roundup"
    :aria-label="`Period roundup for ${periodLabel}`"
  >
    <template #header>
      <header class="finance-roundup__header">
        <div class="finance-roundup__heading">
          <span class="finance-roundup__heading-icon" aria-hidden="true">
            <UIcon name="i-lucide-sparkles" />
          </span>
          <div class="min-w-0">
            <h2 class="finance-roundup__title">Period roundup</h2>
            <p class="finance-roundup__subtitle">
              The service signals worth a closer look.
            </p>
          </div>
        </div>

        <UBadge color="neutral" variant="soft" size="sm">
          {{ periodLabel }}
        </UBadge>
      </header>
    </template>

    <div v-if="hasInsights" class="finance-roundup__content">
      <article v-if="bestDay" class="finance-roundup__lead">
        <div class="finance-roundup__eyebrow">
          <UIcon name="i-lucide-trophy" aria-hidden="true" />
          <span>Best day</span>
        </div>
        <strong>{{ money(bestDay.grossSalesMinor) }}</strong>
        <p>
          {{ formatDate(bestDay.date) }}
          <span aria-hidden="true">·</span>
          {{ completedSales(bestDay.saleCount) }}
        </p>
      </article>

      <dl class="finance-roundup__list">
        <div v-if="topItem" class="finance-roundup__item">
          <span class="finance-roundup__item-icon" aria-hidden="true">
            <UIcon name="i-lucide-utensils" />
          </span>
          <div class="min-w-0">
            <dt>Top item</dt>
            <dd>
              <strong>{{ topItemName }}</strong>
              <span>
                {{ itemQuantity(topItem.quantity) }} across
                {{ completedSales(topItem.sale_count) }}
              </span>
              <small>
                {{ money(topItem.line_gross.amount_minor) }} item gross sales
              </small>
            </dd>
          </div>
        </div>

        <div v-if="strongestWeekday" class="finance-roundup__item">
          <span class="finance-roundup__item-icon" aria-hidden="true">
            <UIcon name="i-lucide-calendar-range" />
          </span>
          <div class="min-w-0">
            <dt>Strongest weekday</dt>
            <dd>
              <strong>{{ strongestWeekday.label }}</strong>
              <span>
                {{ money(strongestWeekday.averageDailyGrossSalesMinor) }}
                average daily gross sales
              </span>
            </dd>
          </div>
        </div>

        <div v-if="quietestDay" class="finance-roundup__item">
          <span class="finance-roundup__item-icon" aria-hidden="true">
            <UIcon name="i-lucide-volume-1" />
          </span>
          <div class="min-w-0">
            <dt>Quietest day</dt>
            <dd>
              <strong>{{ money(quietestDay.grossSalesMinor) }}</strong>
              <span>
                {{ formatDate(quietestDay.date) }}
                <span aria-hidden="true">·</span>
                {{ completedSales(quietestDay.saleCount) }}
              </span>
            </dd>
          </div>
        </div>
      </dl>
    </div>

    <p v-else class="finance-roundup__empty">
      No completed-sales roundup is available for this period.
    </p>

    <template #footer>
      <div class="finance-roundup__timezone">
        <UIcon name="i-lucide-clock-3" aria-hidden="true" />
        <span>Calendar days use {{ timezone }}.</span>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatFinancialMinorAmount } from 'fireux-finance/runtime/utils/money'
import type { KitchenFinanceItemSummary } from '../models/finance-report.model.ts'

type KitchenFinanceDayHighlight = {
  date: string
  saleCount: number
  grossSalesMinor: number
}

const props = withDefaults(
  defineProps<{
    bestDay: KitchenFinanceDayHighlight | null
    currencyCode: string
    locale?: string
    periodLabel: string
    quietestDay: KitchenFinanceDayHighlight | null
    strongestWeekday?: {
      label: string
      averageDailyGrossSalesMinor: number
    } | null
    timezone: string
    topItem: KitchenFinanceItemSummary | null
  }>(),
  {
    locale: 'en-GB',
    strongestWeekday: null,
  }
)

const hasInsights = computed(() =>
  Boolean(
    props.bestDay ||
      props.quietestDay ||
      props.topItem ||
      props.strongestWeekday
  )
)

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      day: 'numeric',
      month: 'short',
      weekday: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
)

const topItemName = computed(() => {
  if (!props.topItem) return ''
  if (!props.topItem.variant_label) return props.topItem.label
  return `${props.topItem.label} · ${props.topItem.variant_label}`
})

function money(amountMinor: number) {
  return formatFinancialMinorAmount(amountMinor, props.currencyCode, {
    locales: props.locale,
  })
}

function formatDate(value: string) {
  return dateFormatter.value.format(new Date(`${value}T00:00:00.000Z`))
}

function completedSales(count: number) {
  return `${count.toLocaleString(props.locale)} completed ${
    count === 1 ? 'sale' : 'sales'
  }`
}

function itemQuantity(count: number) {
  return `${count.toLocaleString(props.locale)} ${
    count === 1 ? 'item' : 'items'
  }`
}
</script>

<style scoped>
.finance-roundup {
  min-width: 0;
  overflow: hidden;
}

.finance-roundup__header,
.finance-roundup__heading,
.finance-roundup__eyebrow,
.finance-roundup__timezone {
  display: flex;
  align-items: center;
}

.finance-roundup__header {
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.finance-roundup__heading {
  min-width: 0;
  gap: calc(var(--spacing) * 2.5);
}

.finance-roundup__heading-icon,
.finance-roundup__item-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--ui-radius) * 2);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
}

.finance-roundup__heading-icon {
  width: 2.25rem;
  height: 2.25rem;
}

.finance-roundup__heading-icon svg,
.finance-roundup__item-icon svg {
  width: 1rem;
  height: 1rem;
}

.finance-roundup__title {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-normal);
}

.finance-roundup__subtitle {
  margin: calc(var(--spacing) * 0.5) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
}

.finance-roundup__content {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.finance-roundup__lead {
  position: relative;
  overflow: hidden;
  padding: calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 3);
  background:
    radial-gradient(
      circle at 92% 8%,
      color-mix(in srgb, var(--ui-primary) 22%, transparent),
      transparent 40%
    ),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg-elevated)),
      var(--ui-bg-elevated) 65%
    );
}

.finance-roundup__eyebrow {
  gap: calc(var(--spacing) * 1.5);
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

.finance-roundup__eyebrow svg {
  width: 0.9rem;
  height: 0.9rem;
}

.finance-roundup__lead strong {
  display: block;
  margin-top: calc(var(--spacing) * 2);
  overflow-wrap: anywhere;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-2xl), 6vw, var(--text-3xl));
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
}

.finance-roundup__lead p {
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.finance-roundup__lead p > span,
.finance-roundup__item dd span > span {
  margin-inline: calc(var(--spacing) * 1);
}

.finance-roundup__list {
  display: grid;
  margin: 0;
}

.finance-roundup__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: calc(var(--spacing) * 3);
  padding-block: calc(var(--spacing) * 3.5);
  border-top: 1px solid var(--ui-border);
}

.finance-roundup__item:first-child {
  padding-top: 0;
  border-top: 0;
}

.finance-roundup__item:last-child {
  padding-bottom: 0;
}

.finance-roundup__item-icon {
  width: 2rem;
  height: 2rem;
}

.finance-roundup__item dt {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.finance-roundup__item dd {
  min-width: 0;
  margin: calc(var(--spacing) * 0.5) 0 0;
}

.finance-roundup__item dd > strong,
.finance-roundup__item dd > span,
.finance-roundup__item dd > small {
  display: block;
}

.finance-roundup__item dd > strong {
  overflow-wrap: anywhere;
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-snug);
}

.finance-roundup__item dd > span,
.finance-roundup__item dd > small {
  margin-top: calc(var(--spacing) * 1);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
}

.finance-roundup__empty {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.finance-roundup__timezone {
  gap: calc(var(--spacing) * 1.5);
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
}

.finance-roundup__timezone svg {
  width: 0.85rem;
  height: 0.85rem;
}
</style>
