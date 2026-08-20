<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Supplier target wrapper. -->
<template>
  <WorkspaceTargetCollection
    :outcome="props.outcome"
    :count="cards.length"
    entity="supplier targets"
    error-description="Supplier targets could not be loaded. Please try again."
    empty-title="No Supplier targets found"
    empty-description="Suppliers you can access will appear here."
  >
    <template #header>
      <h2>Choose Supplier</h2>
      <p>Select the Supplier workspace target you want to work on.</p>
    </template>

    <SupplierCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
      :link="false"
      action
      :show-badges="false"
      @action="selectSupplier(card.id)"
    />
  </WorkspaceTargetCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../../composables/firestore/utils/view/useSupplierInterface'

const props = withDefaults(
  defineProps<{
    // Workspace target lists consume Supplier interface surfaces; storage completeness belongs in the Firestore stack.
    collection?: SupplierSurface[]
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
    .map((supplier) => String(supplier.id ?? '').trim())
    .filter(Boolean)
)
const workspaceIdSet = computed(() => new Set(workspaceIds.value))
const { cell } = useSupplierInterface()
const cards = computed(() =>
  props.collection
    .map((supplier) => cell(supplier))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
function selectSupplier(id: string) {
  const supplierId = String(id ?? '').trim()
  if (!workspaceIdSet.value.has(supplierId)) return
  emit('select', supplierId)
}
</script>
