<template>
  <UCard variant="subtle" class="overflow-hidden">
    <template #header>
      <div
        v-if="day"
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex min-w-0 items-start gap-3">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <UIcon
              name="i-lucide-calendar-check-2"
              class="size-5"
              aria-hidden="true"
            />
          </span>
          <div class="min-w-0">
            <p
              class="text-xs font-semibold tracking-wider text-primary uppercase"
            >
              Daily roundup
            </p>
            <h2 class="mt-1 text-lg font-semibold text-highlighted">
              {{ formattedDate }}
            </h2>
            <p class="mt-1 text-xs text-muted">
              Completed service in {{ timezone }}.
            </p>
          </div>
        </div>

        <UBadge class="w-fit" color="neutral" variant="outline">
          {{ currencyCode }}
        </UBadge>
      </div>

      <div v-else class="flex items-center gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-elevated text-muted"
        >
          <UIcon name="i-lucide-list-tree" class="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Daily roundup
          </h2>
          <p class="mt-0.5 text-xs text-muted">
            Day totals and item contribution.
          </p>
        </div>
      </div>
    </template>

    <div
      v-if="!day"
      class="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <span
        class="flex size-12 items-center justify-center rounded-full bg-elevated text-muted"
      >
        <UIcon
          name="i-lucide-mouse-pointer-click"
          class="size-6"
          aria-hidden="true"
        />
      </span>
      <p class="mt-4 text-sm font-semibold text-highlighted">
        Select a calendar day
      </p>
      <p class="mt-1 max-w-sm text-xs leading-5 text-muted">
        Its gross sales, completed sales and item roundup will appear here.
      </p>
    </div>

    <div
      v-else-if="!currencySummary || currencySummary.sale_count === 0"
      class="py-5"
    >
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-receipt-text"
        title="No completed sales"
        :description="`There are no completed ${currencyCode} sales to break down for this day.`"
      />
    </div>

    <div v-else class="space-y-7">
      <dl class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="metric in headlineMetrics"
          :key="metric.label"
          class="rounded-xl border border-default bg-default p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <dt class="text-xs font-medium text-muted">
              {{ metric.label }}
            </dt>
            <UIcon
              :name="metric.icon"
              class="size-4 text-primary"
              aria-hidden="true"
            />
          </div>
          <dd
            class="mt-3 truncate text-xl font-bold tracking-tight text-highlighted tabular-nums"
          >
            {{ metric.value }}
          </dd>
          <p v-if="metric.description" class="mt-1 text-xs text-dimmed">
            {{ metric.description }}
          </p>
        </div>
      </dl>

      <div
        class="grid gap-3 rounded-xl border border-default bg-elevated/40 p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"
      >
        <div>
          <p class="text-xs font-medium text-muted">Item sales</p>
          <p class="mt-1 text-sm font-semibold text-highlighted tabular-nums">
            {{ formattedItemSales }}
          </p>
        </div>
        <UIcon
          name="i-lucide-plus"
          class="hidden size-4 text-dimmed sm:block"
          aria-hidden="true"
        />
        <div>
          <p class="text-xs font-medium text-muted">Delivery fees</p>
          <p class="mt-1 text-sm font-semibold text-highlighted tabular-nums">
            {{ formattedDeliveryFees }}
          </p>
        </div>
        <UIcon
          name="i-lucide-equal"
          class="hidden size-4 text-dimmed sm:block"
          aria-hidden="true"
        />
        <div>
          <p class="text-xs font-medium text-muted">Gross sales</p>
          <p class="mt-1 text-sm font-semibold text-highlighted tabular-nums">
            {{ formattedGrossSales }}
          </p>
        </div>
      </div>

      <section aria-labelledby="kitchen-finance-day-items-title">
        <div
          class="flex flex-col gap-2 border-b border-default pb-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h3
              id="kitchen-finance-day-items-title"
              class="text-sm font-semibold text-highlighted"
            >
              Item roundup
            </h3>
            <p class="mt-1 text-xs text-muted">
              Item contribution to recorded item sales for this day.
            </p>
          </div>
          <p v-if="sortedItems.length" class="text-xs font-medium text-dimmed">
            {{ formatCount(sortedItems.length) }}
            {{ sortedItems.length === 1 ? 'item line' : 'item lines' }}
          </p>
        </div>

        <div
          v-if="!sortedItems.length"
          class="flex min-h-36 flex-col items-center justify-center py-8 text-center"
        >
          <UIcon
            name="i-lucide-list-x"
            class="size-6 text-dimmed"
            aria-hidden="true"
          />
          <p class="mt-3 text-sm font-medium text-highlighted">
            No item breakdown available
          </p>
          <p class="mt-1 text-xs text-muted">
            The day total remains available above.
          </p>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto sm:block">
            <table class="w-full border-separate border-spacing-0 text-left">
              <caption class="sr-only">
                Item sales for
                {{
                  formattedDate
                }}
              </caption>
              <thead>
                <tr class="text-xs text-dimmed">
                  <th scope="col" class="py-3 pr-4 font-medium">Item</th>
                  <th scope="col" class="px-3 py-3 text-right font-medium">
                    Quantity
                  </th>
                  <th scope="col" class="px-3 py-3 text-right font-medium">
                    Sales
                  </th>
                  <th scope="col" class="px-3 py-3 text-right font-medium">
                    Item sales
                  </th>
                  <th scope="col" class="py-3 pl-4 text-right font-medium">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr v-for="item in sortedItems" :key="item.key">
                  <th scope="row" class="py-4 pr-4 font-normal">
                    <span class="block text-sm font-semibold text-highlighted">
                      {{ item.label }}
                    </span>
                    <span
                      v-if="item.variantLabel"
                      class="mt-1 block text-xs text-muted"
                    >
                      {{ item.variantLabel }}
                    </span>
                  </th>
                  <td
                    class="px-3 py-4 text-right text-sm font-medium text-highlighted tabular-nums"
                  >
                    {{ item.quantityLabel }}
                  </td>
                  <td
                    class="px-3 py-4 text-right text-sm text-muted tabular-nums"
                  >
                    {{ item.saleCountLabel }}
                  </td>
                  <td
                    class="px-3 py-4 text-right text-sm font-semibold text-highlighted tabular-nums"
                  >
                    {{ item.grossLabel }}
                  </td>
                  <td class="w-28 py-4 pl-4">
                    <div class="flex items-center justify-end gap-2">
                      <span
                        class="h-1.5 w-12 overflow-hidden rounded-full bg-elevated"
                        aria-hidden="true"
                      >
                        <span
                          class="block h-full rounded-full bg-primary"
                          :style="{ width: `${item.sharePercent}%` }"
                        />
                      </span>
                      <span
                        class="w-11 text-right text-xs font-medium text-muted tabular-nums"
                      >
                        {{ item.shareLabel }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="divide-y divide-default sm:hidden">
            <article
              v-for="item in sortedItems"
              :key="item.key"
              class="py-4 first:pt-4 last:pb-0"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <h4 class="truncate text-sm font-semibold text-highlighted">
                    {{ item.label }}
                  </h4>
                  <p v-if="item.variantLabel" class="mt-1 text-xs text-muted">
                    {{ item.variantLabel }}
                  </p>
                </div>
                <p
                  class="shrink-0 text-sm font-bold text-highlighted tabular-nums"
                >
                  {{ item.grossLabel }}
                </p>
              </div>

              <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
                <span
                  class="block h-full rounded-full bg-primary"
                  :style="{ width: `${item.sharePercent}%` }"
                />
              </div>

              <dl class="mt-3 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <dt class="text-dimmed">Quantity</dt>
                  <dd class="mt-1 font-semibold text-highlighted tabular-nums">
                    {{ item.quantityLabel }}
                  </dd>
                </div>
                <div>
                  <dt class="text-dimmed">Sales</dt>
                  <dd class="mt-1 font-semibold text-highlighted tabular-nums">
                    {{ item.saleCountLabel }}
                  </dd>
                </div>
                <div class="text-right">
                  <dt class="text-dimmed">Share</dt>
                  <dd class="mt-1 font-semibold text-highlighted tabular-nums">
                    {{ item.shareLabel }}
                  </dd>
                </div>
              </dl>
            </article>
          </div>
        </template>
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { KitchenFinanceDailySummary } from '../models/finance-report.model.ts'
import { useKitchenFinanceDayDetail } from '../composables/finance/useKitchenFinanceDayDetail'

const props = withDefaults(
  defineProps<{
    currencyCode: string
    day: KitchenFinanceDailySummary | null
    locale?: string
    timezone: string
  }>(),
  { locale: 'en-GB' }
)
const {
  currencySummary,
  formattedDate,
  formattedGrossSales,
  formattedItemSales,
  formattedDeliveryFees,
  headlineMetrics,
  sortedItems,
  formatCount,
} = useKitchenFinanceDayDetail(props)
</script>
