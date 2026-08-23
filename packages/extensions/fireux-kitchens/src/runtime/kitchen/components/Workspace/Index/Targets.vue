<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Kitchen dual-source target presentation. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: remove the local mount-state loading fork. -->
<template>
  <section class="space-y-4">
    <WorkspaceKitchenIndexTargetSection
      v-if="mode === 'all' || outcome !== 'empty'"
      :title="mode === 'free' ? 'Your kitchen' : 'Your kitchens'"
      :description="
        mode === 'free'
          ? 'Open the Kitchen connected to your account.'
          : 'Live kitchens linked to your current user profile.'
      "
      source="live"
      :collection="mode === 'free' ? freeCollection : collection"
      :outcome="outcome"
      :selected-id="selectedId"
      :selected-source="selectedSource"
      @select="selectKitchen"
    />

    <WorkspaceKitchenIndexTargetSection
      v-if="mode === 'all' || outcome === 'empty'"
      :title="mode === 'free' ? 'Explore a demo kitchen' : 'Demo kitchens'"
      :description="
        mode === 'free'
          ? 'See how KitchenAI works with read-only example data.'
          : 'Explore with our read-only kitchens.'
      "
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
    mode?: 'all' | 'free'
    selectedId?: string
    selectedSource?: KitchenFetchSource
  }>(),
  {
    collection: () => [],
    demoCollection: () => [],
    selectedId: '',
    selectedSource: 'live',
    mode: 'all',
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
const freeCollection = computed(() => props.collection.slice(0, 1))
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
