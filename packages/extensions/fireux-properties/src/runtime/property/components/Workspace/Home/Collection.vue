<template>
  <WorkspaceEntityCollection
    :outcome="workspace.collectionOutcome.value"
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
      @action="workspace.select(card.id)"
    />
  </WorkspaceEntityCollection>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyInterface } from '../../../composables/firestore/utils/view/usePropertyInterface'
import type { usePropertyWorkspace } from '../../../composables/workspace/usePropertyWorkspace'
const props = defineProps<{
  workspace: ReturnType<typeof usePropertyWorkspace>
}>()
const { pill } = usePropertyInterface()
const cards = computed(() =>
  props.workspace.collection.value
    .map((entity) => pill(entity))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)
</script>
