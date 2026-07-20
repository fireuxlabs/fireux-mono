<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Kitchen per-source target wrapper. -->
<template>
  <ConsoleTargetCollection
    :outcome="props.outcome"
    :count="cards.length"
    :entity="stateCopy.entity"
    :error-description="stateCopy.errorDescription"
    :empty-title="stateCopy.emptyTitle"
    :empty-description="stateCopy.emptyDescription"
  >
    <template #header>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </template>

    <KitchenCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
      :link="false"
      action
      :show-source="false"
      :show-badges="false"
      :selected="isSelected(card.id)"
      @action="selectKitchen(card.id)"
    />
  </ConsoleTargetCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { KitchenFetchSource } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    collection?: KitchenSurface[]
    outcome: ConsoleTargetOutcome
    source?: KitchenFetchSource
    selectedId?: string
    selectedSource?: KitchenFetchSource
  }>(),
  {
    collection: () => [],
    source: 'live',
    selectedId: '',
    selectedSource: 'live',
  }
)

const emit = defineEmits<{
  (event: 'select', id: string, source: KitchenFetchSource): void
}>()

const { cell } = useKitchenInterface()
const cards = computed(() =>
  props.collection
    .map((kitchen) => cell(kitchen))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
const cardIdSet = computed(() =>
  new Set(cards.value.map((card) => card.id).filter(Boolean))
)
const selectedId = computed(() => String(props.selectedId ?? '').trim())
const stateCopy = computed(() =>
  props.source === 'demo'
    ? {
        entity: 'demo kitchen targets',
        errorDescription: 'Demo kitchens could not be loaded. Please try again.',
        emptyTitle: 'No demo kitchens found',
        emptyDescription: 'Read-only demo kitchens will appear here.',
      }
    : {
        entity: 'kitchen targets',
        errorDescription: 'Your kitchens could not be loaded. Please try again.',
        emptyTitle: 'No kitchens linked to you',
        emptyDescription: 'Kitchens linked to your current user profile will appear here.',
      }
)

function selectKitchen(id: string) {
  const kitchenId = String(id ?? '').trim()
  if (!cardIdSet.value.has(kitchenId)) return
  emit('select', kitchenId, props.source)
}

function isSelected(id: string) {
  return (
    selectedId.value === String(id ?? '').trim() &&
    props.selectedSource === props.source
  )
}
</script>
