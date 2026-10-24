<template>
  <WorkspaceEntityCollection
    :outcome="workspace.collectionOutcome.value"
    :count="cards.length"
    entity="suppliers"
    error-description="Suppliers could not be loaded."
    empty-title="No suppliers yet"
    empty-description="Your available suppliers will appear here."
  >
    <template #header><h2 class="font-semibold">My Suppliers</h2></template>
    <template #actions
      ><UButton
        label="Create Supplier"
        to="/workspace/supplier/create"
        icon="i-lucide-plus"
    /></template>
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
import { useSupplierInterface } from '../../../composables/firestore/utils/view/useSupplierInterface'
import type { useSupplierWorkspace } from '../../../composables/workspace/useSupplierWorkspace'
const props = defineProps<{
  workspace: ReturnType<typeof useSupplierWorkspace>
}>()
const { pill } = useSupplierInterface()
const cards = computed(() =>
  props.workspace.collection.value
    .map((entity) => pill(entity))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)
</script>
