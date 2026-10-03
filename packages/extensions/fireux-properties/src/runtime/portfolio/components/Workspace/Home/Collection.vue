<template>
  <WorkspaceEntityCollection
    :outcome="index.outcome.value"
    :count="cards.length"
    entity="portfolios"
    error-description="Portfolios could not be loaded."
    empty-title="No portfolios yet"
    empty-description="Your available portfolios will appear here."
  >
    <template #header><h2 class="font-semibold">My Portfolios</h2></template>
    <template #actions
      ><UButton
        label="Create Portfolio"
        to="/workspace/portfolio/create"
        icon="i-lucide-plus"
    /></template>
    <WorkspaceTargetCard
      v-for="card in cards"
      :key="card.id"
      :card="card"
      action
      :show-badges="false"
      @action="index.select(card.id)"
    />
  </WorkspaceEntityCollection>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioInterface } from '../../../composables/firestore/utils/view/usePortfolioInterface'
import type { usePortfolioWorkspaceIndex } from '../../../composables/workspace/usePortfolioWorkspaceIndex'
const props = defineProps<{
  index: ReturnType<typeof usePortfolioWorkspaceIndex>
}>()
const { pill } = usePortfolioInterface()
const cards = computed(() =>
  props.index.collection.value
    .map((entity) => pill(entity))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)
</script>
