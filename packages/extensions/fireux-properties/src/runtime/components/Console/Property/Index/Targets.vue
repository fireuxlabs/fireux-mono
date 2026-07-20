<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Property target wrapper. -->
<template>
  <ConsoleTargetCollection
    :outcome="props.outcome"
    :count="cards.length"
    entity="property targets"
    error-description="Property targets could not be loaded. Please try again."
    empty-title="No Property targets found"
    empty-description="Properties you can access will appear here."
  >
    <template #header>
      <h2>Choose Property</h2>
      <p>Select the Property console target you want to work on.</p>
    </template>

    <PropertyCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
      :link="false"
      action
      @action="selectProperty(card.id)"
    />
  </ConsoleTargetCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { Property } from '../../../../models/property.model'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
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
    .map((property) => String(property.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
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
  if (!consoleIdSet.value.has(propertyId)) return
  emit('select', propertyId)
}
</script>
