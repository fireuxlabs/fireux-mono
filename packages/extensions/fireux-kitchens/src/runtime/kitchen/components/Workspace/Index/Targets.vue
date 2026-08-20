<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Kitchen dual-source target presentation. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: remove the local mount-state loading fork. -->
<template>
  <section class="space-y-4">
    <WorkspaceKitchenIndexTargetSection
      title="Your kitchens"
      description="Live kitchens linked to your current user profile."
      source="live"
      :collection="collection"
      :outcome="outcome"
      :selected-id="selectedId"
      :selected-source="selectedSource"
      @select="selectKitchen"
    />

    <WorkspaceKitchenIndexTargetSection
      title="Demo kitchens"
      description="Explore with our read-only kitchens."
      source="demo"
      :collection="demoCollection"
      :outcome="demoOutcome"
      :selected-id="selectedId"
      :selected-source="selectedSource"
      @select="selectKitchen"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import type { KitchenFetchSource } from '../../../composables/firestore/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../composables/firestore/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
    demoCollection?: KitchenSurface[]
    outcome: WorkspaceTargetOutcome
    demoOutcome: WorkspaceTargetOutcome
    selectedId?: string
    selectedSource?: KitchenFetchSource
  }>(),
  {
    collection: () => [],
    demoCollection: () => [],
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
const demoIds = computed(() =>
  props.demoCollection
    .map((kitchen) => String(kitchen.id ?? '').trim())
    .filter(Boolean)
)
const demoIdSet = computed(() => new Set(demoIds.value))

function selectKitchen(id: string, source: KitchenFetchSource) {
  const kitchenId = String(id ?? '').trim()
  if (source === 'demo' && !demoIdSet.value.has(kitchenId)) return
  if (source === 'live' && !workspaceIdSet.value.has(kitchenId)) return
  emit('select', kitchenId, source)
}
</script>
