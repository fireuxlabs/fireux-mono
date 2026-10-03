<template>
  <WorkspaceEntityCollection
    :outcome="index.outcome.value"
    :count="cards.length"
    entity="properties"
    error-description="Properties could not be loaded."
    empty-title="No properties yet"
    empty-description="Your available properties will appear here."
  >
    <template #header><h2 class="font-semibold">My Properties</h2></template>
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
import { usePropertyInterface } from '../../../composables/firestore/utils/view/usePropertyInterface'
import type { usePropertyWorkspaceIndex } from '../../../composables/workspace/usePropertyWorkspaceIndex'
const props = defineProps<{
  index: ReturnType<typeof usePropertyWorkspaceIndex>
}>()
const { pill } = usePropertyInterface()
const cards = computed(() =>
  props.index.collection.value
    .map((entity) => pill(entity))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)
</script>
