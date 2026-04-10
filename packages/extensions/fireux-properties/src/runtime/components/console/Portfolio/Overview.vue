<template>
  <section class="space-y-6">
    <div v-if="portfolio" class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Focus</div>
            <p class="text-sm text-dimmed">
              Metrics for the selected portfolio.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            {{ portfolioTitle }}
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ focusUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            User totals for the selected portfolio are not wired yet.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">All</div>
            <p class="text-sm text-dimmed">
              Metrics across every portfolio in the collection.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            All Portfolios
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ allUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            Total portfolios in scope: {{ totalPortfoliosLabel }}.
          </p>
        </div>
      </UCard>
    </div>

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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioConsole } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsole'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'

const { portfolioState, portfolio } = usePortfolioConsole()
const { count: totalPortfolios } = usePortfolioCollection()
const selectedPortfolio = computed(
  () => portfolioState.portfolio.value as Record<string, unknown> | null
)

const normalizeString = (value: unknown): string => String(value || '').trim()

const portfolioId = computed(() => portfolioState.id.value)
const portfolioName = computed(() => normalizeString(selectedPortfolio.value?.name))
const portfolioSlug = computed(() => normalizeString(selectedPortfolio.value?.slug))
const portfolioStatus = computed(() => normalizeString(selectedPortfolio.value?.status))
const ownerLabel = computed(() => normalizeString(selectedPortfolio.value?.owner_label))
const regionLabel = computed(() => normalizeString(selectedPortfolio.value?.region_label))
const strategyLabel = computed(() =>
  normalizeString(selectedPortfolio.value?.strategy_label)
)
const portfolioNotes = computed(() => normalizeString(selectedPortfolio.value?.notes))

const portfolioTitle = computed(
  () =>
    portfolio.value?.title ||
    portfolioName.value ||
    portfolioSlug.value ||
    portfolioId.value ||
    'Selected Portfolio'
)
const focusUsersValue = computed(() => '—')
const allUsersValue = computed(() => '—')
const totalPortfoliosLabel = computed(() => String(totalPortfolios.value || 0))
</script>
