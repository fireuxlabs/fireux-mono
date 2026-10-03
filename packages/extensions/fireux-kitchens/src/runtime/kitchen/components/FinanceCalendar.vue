<template>
  <UCard variant="subtle" class="overflow-hidden">
    <template #header>
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <UIcon
                name="i-lucide-calendar-days"
                class="size-5"
                aria-hidden="true"
              />
            </span>
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-highlighted">
                Daily sales
              </h2>
              <p class="mt-0.5 text-xs text-muted">
                Select a day to inspect its item roundup.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="neutral" variant="soft" icon="i-lucide-clock-3">
            {{ timezone }}
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ currencyCode }}
          </UBadge>
        </div>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          :disabled="!canShowPreviousMonth"
          :aria-label="`Show ${previousMonthLabel}`"
          @click="showPreviousMonth"
        />

        <div class="text-center">
          <p class="text-sm font-semibold text-highlighted">
            {{ visibleMonthLabel }}
          </p>
          <p class="mt-0.5 text-xs text-dimmed">
            {{ representedRangeLabel }}
          </p>
        </div>

        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          :disabled="!canShowNextMonth"
          :aria-label="`Show ${nextMonthLabel}`"
          @click="showNextMonth"
        />
      </div>
    </template>

    <div v-if="hasRepresentedDays" class="-m-4 sm:-m-6">
      <div class="p-4 sm:p-6">
        <div
          role="group"
          :aria-label="`${visibleMonthLabel} sales calendar in ${timezone}`"
          class="grid grid-cols-7 gap-1 sm:gap-2"
        >
          <div
            v-for="weekday in weekdayLabels"
            :key="weekday"
            class="pb-1 text-center text-xs font-semibold tracking-wider text-dimmed uppercase sm:px-2"
            aria-hidden="true"
          >
            {{ weekday }}
          </div>

          <button
            v-for="cell in calendarCells"
            :key="cell.date"
            type="button"
            :disabled="!cell.withinRange"
            :aria-label="cell.ariaLabel"
            :aria-pressed="cell.date === selectedDate"
            class="group relative min-h-14 overflow-hidden rounded-lg border p-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed sm:min-h-32 sm:rounded-xl sm:p-3"
            :class="cellClasses(cell)"
            @click="selectDate(cell)"
          >
            <span
              v-if="cell.hasSales && cell.withinRange"
              class="absolute inset-x-0 bottom-0 h-1 bg-primary transition-all"
              :class="heatBarClass(cell.heatLevel)"
              aria-hidden="true"
            />

            <span class="flex items-start justify-between gap-2">
              <span
                class="flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                :class="
                  cell.date === selectedDate
                    ? 'bg-primary text-inverted'
                    : 'text-highlighted'
                "
              >
                {{ cell.dayNumber }}
              </span>
              <UIcon
                v-if="cell.date === selectedDate"
                name="i-lucide-check"
                class="mt-1 hidden size-4 text-primary sm:block"
                aria-hidden="true"
              />
            </span>

            <template v-if="cell.withinRange && cell.hasSales">
              <span
                class="mt-3 hidden truncate text-sm font-bold tracking-tight text-highlighted tabular-nums sm:block"
              >
                {{ cell.grossSalesLabel }}
              </span>
              <span
                class="mt-2 hidden items-center gap-1.5 text-xs font-medium text-muted sm:flex"
              >
                <UIcon
                  name="i-lucide-receipt-text"
                  class="size-3.5"
                  aria-hidden="true"
                />
                {{ cell.saleCountLabel }}
              </span>
              <span
                class="mt-1 hidden items-center gap-1.5 text-xs font-medium text-muted sm:flex"
              >
                <UIcon
                  name="i-lucide-utensils"
                  class="size-3.5"
                  aria-hidden="true"
                />
                {{ cell.itemQuantityLabel }}
              </span>
            </template>

            <span
              v-else-if="cell.withinRange"
              class="mt-4 hidden text-xs leading-5 text-dimmed sm:block"
            >
              No completed sales
            </span>
          </button>
        </div>

        <div
          class="mt-5 flex flex-col gap-3 border-t border-default pt-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <p>Darker days recorded more gross sales in this report.</p>
          <div class="flex items-center gap-2" aria-label="Sales intensity">
            <span>Lower</span>
            <span
              v-for="level in 4"
              :key="level"
              class="size-3 rounded-sm bg-primary"
              :class="heatBarClass(level)"
              aria-hidden="true"
            />
            <span>Higher</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <span
        class="flex size-12 items-center justify-center rounded-full bg-elevated text-muted"
      >
        <UIcon name="i-lucide-calendar-x-2" class="size-6" aria-hidden="true" />
      </span>
      <p class="mt-4 text-sm font-semibold text-highlighted">
        No daily sales available
      </p>
      <p class="mt-1 max-w-sm text-xs leading-5 text-muted">
        Daily totals will appear here when the selected report contains
        completed sales.
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { KitchenFinanceDailySummary } from '../models/finance-report.model.ts'
import { useKitchenFinanceCalendar } from './useKitchenFinanceCalendar'
const props = withDefaults(
  defineProps<{
    currencyCode: string
    days: KitchenFinanceDailySummary[]
    locale?: string
    selectedDate: string
    timezone: string
  }>(),
  { locale: 'en-GB' }
)
const emit = defineEmits<{ 'update:selectedDate': [date: string] }>()
const { hasRepresentedDays, weekdayLabels, visibleMonthLabel, previousMonthLabel, nextMonthLabel, representedRangeLabel, canShowPreviousMonth, canShowNextMonth, calendarCells, cellClasses, heatBarClass, selectDate, showPreviousMonth, showNextMonth } = useKitchenFinanceCalendar(props, emit)
</script>
