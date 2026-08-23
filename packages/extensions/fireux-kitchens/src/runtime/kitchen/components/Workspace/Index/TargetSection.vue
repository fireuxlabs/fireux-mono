<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Kitchen per-source target wrapper. -->
<template>
  <WorkspaceTargetCollection
    :outcome="props.outcome"
    :count="cards.length"
    :entity="stateCopy.entity"
    :title="title"
    :description="description"
    :error-description="stateCopy.errorDescription"
    :empty-title="stateCopy.emptyTitle"
    :empty-description="stateCopy.emptyDescription"
  >
    <WorkspaceTargetCard
      v-for="card in cards"
      :key="card.id"
      :card="card"
      action
      :selected="isSelected(card.id)"
      @action="selectKitchen(card.id)"
    />
  </WorkspaceTargetCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDirectoryIndex'
import type { WorkspaceTargetCard as WorkspaceTargetCardType } from 'fireux-core/runtime/components/Workspace/types'
import type { KitchenFetchSource } from '../../../composables/firestore/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../composables/firestore/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../composables/firestore/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    collection?: KitchenSurface[]
    outcome: WorkspaceTargetOutcome
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

const { workspaceTarget } = useKitchenInterface()
const cards = computed(() =>
  props.collection
    .map((kitchen): WorkspaceTargetCardType | null => {
      const card = workspaceTarget(kitchen)
      if (!card) return null

      return {
        id: card.id,
        title: card.name,
        subtitle: card.shortAddress,
        imageUrl: card.imageUrl,
        imageAlt: `${card.name} logo`,
        imageFit: 'contain',
        imageBackground: card.mediaBackdropColor,
        icon: 'i-lucide-chef-hat',
        badges: [props.source === 'demo' ? 'Demo · Read-only' : 'Live'],
      }
    })
    .filter((card): card is WorkspaceTargetCardType => Boolean(card))
)
const cardIdSet = computed(
  () => new Set(cards.value.map((card) => card.id).filter(Boolean))
)
const selectedId = computed(() => String(props.selectedId ?? '').trim())
const stateCopy = computed(() =>
  props.source === 'demo'
    ? {
        entity: 'demo kitchen targets',
        errorDescription:
          'Demo kitchens could not be loaded. Please try again.',
        emptyTitle: 'No demo kitchens found',
        emptyDescription: 'Read-only demo kitchens will appear here.',
      }
    : {
        entity: 'kitchen targets',
        errorDescription:
          'Your kitchens could not be loaded. Please try again.',
        emptyTitle: 'No kitchens linked to you',
        emptyDescription:
          'Kitchens linked to your current user profile will appear here.',
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
