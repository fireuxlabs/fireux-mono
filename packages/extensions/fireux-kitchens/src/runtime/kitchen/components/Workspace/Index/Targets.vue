<template>
  <WorkspaceKitchenIndexTargetSection
    title="Your kitchens"
    description="Kitchens linked to your account."
    source="live"
    :collection="collection"
    :outcome="outcome"
    :selected-id="selectedId"
    :selected-source="selectedSource"
    @select="selectKitchen"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import type { KitchenFetchSource } from '../../../composables/firestore/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../composables/firestore/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
    outcome: WorkspaceTargetOutcome
    selectedId?: string
    selectedSource?: KitchenFetchSource
  }>(),
  {
    collection: () => [],
    selectedId: '',
    selectedSource: 'live',
  }
)

const emit = defineEmits<{
  (event: 'select', id: string, source: KitchenFetchSource): void
}>()

const workspaceIds = computed(() =>
  props.collection
    .map((kitchen) => String(kitchen.id ?? '').trim())
    .filter(Boolean)
)
const workspaceIdSet = computed(() => new Set(workspaceIds.value))
function selectKitchen(id: string, source: KitchenFetchSource) {
  const kitchenId = String(id ?? '').trim()
  if (source === 'live' && !workspaceIdSet.value.has(kitchenId)) return
  emit('select', kitchenId, source)
}
</script>
