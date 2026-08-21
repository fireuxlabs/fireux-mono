<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: replace the Kitchen-only preview fork with shared selected-target chrome. -->
<template>
  <WorkspaceSelectedTarget
    label="Kitchen"
    :selected-id="kitchenId"
    :description="kitchenName"
    :target="targetCard"
    :outcome="outcome"
    icon="i-lucide-chef-hat"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/components/Workspace/types'
import type { KitchenFetchSource } from '../../../composables/firestore/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../composables/firestore/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../composables/firestore/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    kitchen?: KitchenSurface | null
    kitchenId?: string
    source?: KitchenFetchSource
    outcome?: WorkspaceTargetOutcome
  }>(),
  {
    kitchen: null,
    kitchenId: '',
    source: 'live',
    outcome: 'ready',
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const kitchenName = computed(() =>
  String(props.kitchen?.name || props.kitchen?.slug || '').trim()
)
const { workspaceTarget } = useKitchenInterface()
const kitchenCard = computed(() => workspaceTarget(props.kitchen))
const targetCard = computed<WorkspaceTargetCard | null>(() => {
  const card = kitchenCard.value
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
</script>
