<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Portfolio Summary</div>
        <p class="text-sm text-dimmed">
          Live details for the currently selected portfolio.
        </p>
      </div>
    </template>

    <div v-if="portfolio" class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
      <div>
        Portfolio ID:
        <span class="font-medium text-default">{{ portfolioId }}</span>
      </div>
      <div v-if="portfolioName">
        Name:
        <span class="font-medium text-default">{{ portfolioName }}</span>
      </div>
      <div v-if="portfolioSlug">
        Slug:
        <span class="font-medium text-default">{{ portfolioSlug }}</span>
      </div>
      <div v-if="portfolioStatus">
        Status:
        <span class="font-medium text-default">{{ portfolioStatus }}</span>
      </div>
      <div v-if="ownerLabel">
        Owner:
        <span class="font-medium text-default">{{ ownerLabel }}</span>
      </div>
      <div v-if="regionLabel">
        Region:
        <span class="font-medium text-default">{{ regionLabel }}</span>
      </div>
      <div v-if="strategyLabel" class="sm:col-span-2">
        Strategy:
        <span class="font-medium text-default">{{ strategyLabel }}</span>
      </div>
      <div v-if="portfolioNotes" class="sm:col-span-2">
        Notes:
        <span class="font-medium text-default">{{ portfolioNotes }}</span>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No live portfolio is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActivePortfolio } from '../../../../composables/fireux/app/portfolio-console/useActivePortfolio'

const portfolioState = useActivePortfolio()
const portfolio = computed(
  () => portfolioState.portfolio.value as Record<string, unknown> | null
)

const normalizeString = (value: unknown): string => String(value || '').trim()

const portfolioId = computed(() => portfolioState.id.value)
const portfolioName = computed(() => normalizeString(portfolio.value?.name))
const portfolioSlug = computed(() => normalizeString(portfolio.value?.slug))
const portfolioStatus = computed(() => normalizeString(portfolio.value?.status))
const ownerLabel = computed(() => normalizeString(portfolio.value?.owner_label))
const regionLabel = computed(() => normalizeString(portfolio.value?.region_label))
const strategyLabel = computed(() =>
  normalizeString(portfolio.value?.strategy_label)
)
const portfolioNotes = computed(() => normalizeString(portfolio.value?.notes))
</script>
