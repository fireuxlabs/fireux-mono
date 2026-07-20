<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Portfolio target wrapper. -->
<template>
  <ConsoleTargetCollection
    :outcome="props.outcome"
    :count="cards.length"
    entity="portfolio targets"
    error-description="Portfolio targets could not be loaded. Please try again."
    empty-title="No Portfolio targets found"
    empty-description="Portfolios you can access will appear here."
  >
    <template #header>
      <h2>Choose Portfolio</h2>
      <p>Select the Portfolio console target you want to work on.</p>
    </template>

    <PortfolioCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
      :link="false"
      action
      :show-badges="false"
      @action="selectPortfolio(card.id)"
    />
  </ConsoleTargetCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

const props = withDefaults(
  defineProps<{
    // Console target lists consume Portfolio interface surfaces; storage completeness belongs in the Firestore stack.
    collection?: PortfolioSurface[]
    outcome: ConsoleTargetOutcome
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const consoleIds = computed(() =>
  props.collection
    .map((portfolio) => String(portfolio.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
const { cell } = usePortfolioInterface()
const cards = computed(() =>
  props.collection
    .map((portfolio) => cell(portfolio))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
function selectPortfolio(id: string) {
  const portfolioId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(portfolioId)) return
  emit('select', portfolioId)
}
</script>
