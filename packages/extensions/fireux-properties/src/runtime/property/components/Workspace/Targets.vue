<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Property target wrapper. -->
<template>
  <WorkspaceEntityCollection
    :outcome="props.outcome"
    :count="cards.length"
    entity="property targets"
    error-description="Property targets could not be loaded. Please try again."
    empty-title="No Property targets found"
    empty-description="Properties you can access will appear here."
  >
    <template #header>
      <h2>Choose Property</h2>
      <p>Select the Property workspace target you want to work on.</p>
    </template>

    <PropertyCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
      :link="false"
      action
      @action="selectProperty(card.id)"
    />
  </WorkspaceEntityCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import type { Property } from '../../models/property.model.ts'
import { usePropertyInterface } from '../../composables/firestore/utils/view/usePropertyInterface'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
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
    .map((property) => String(property.id ?? '').trim())
    .filter(Boolean)
)
const workspaceIdSet = computed(() => new Set(workspaceIds.value))
const { cell } = usePropertyInterface()
const cards = computed(() =>
  props.collection
    .map((property) => cell(property))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
function selectProperty(id: string) {
  const propertyId = String(id ?? '').trim()
  if (!workspaceIdSet.value.has(propertyId)) return
  emit('select', propertyId)
}
</script>
