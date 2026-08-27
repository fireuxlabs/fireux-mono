<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Portfolio target wrapper. -->
<template>
  <WorkspaceEntityCollection
    :outcome="props.outcome"
    :count="cards.length"
    entity="portfolio targets"
    error-description="Portfolio targets could not be loaded. Please try again."
    empty-title="No Portfolio targets found"
    empty-description="Portfolios you can access will appear here."
  >
    <template #header>
      <h2>Choose Portfolio</h2>
      <p>Select the Portfolio workspace target you want to work on.</p>
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
  </WorkspaceEntityCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../composables/firestore/utils/view/usePortfolioInterface'

const props = withDefaults(
  defineProps<{
    // Workspace target lists consume Portfolio interface surfaces; storage completeness belongs in the Firestore stack.
    collection?: PortfolioSurface[]
    outcome: WorkspaceTargetOutcome
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const workspaceIds = computed(() =>
  props.collection
    .map((portfolio) => String(portfolio.id ?? '').trim())
    .filter(Boolean)
)
const workspaceIdSet = computed(() => new Set(workspaceIds.value))
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
  if (!workspaceIdSet.value.has(portfolioId)) return
  emit('select', portfolioId)
}
</script>
