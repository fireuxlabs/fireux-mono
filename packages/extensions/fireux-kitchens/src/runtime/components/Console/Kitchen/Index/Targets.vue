<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Kitchen dual-source target presentation. -->
<template>
  <section class="space-y-4">
    <MoleculesStateCard
      v-if="!isMounted"
      entity="kitchen targets"
      state="loading"
      surface="bare"
    />

    <template v-else>
      <ConsoleKitchenIndexTargetSection
        title="Your kitchens"
        description="Live kitchens linked to your current user profile."
        source="live"
        :collection="collection"
        :outcome="outcome"
        :selected-id="selectedId"
        :selected-source="selectedSource"
        @select="selectKitchen"
      />

      <ConsoleKitchenIndexTargetSection
        title="Demo kitchens"
        description="Explore with our read-only kitchens."
        source="demo"
        :collection="demoCollection"
        :outcome="demoOutcome"
        :selected-id="selectedId"
        :selected-source="selectedSource"
        @select="selectKitchen"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { KitchenFetchSource } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
    demoCollection?: KitchenSurface[]
    outcome: ConsoleTargetOutcome
    demoOutcome: ConsoleTargetOutcome
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

const isMounted = ref(false)
const consoleIds = computed(() =>
  props.collection
    .map((kitchen) => String(kitchen.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
const demoIds = computed(() =>
  props.demoCollection
    .map((kitchen) => String(kitchen.id ?? '').trim())
    .filter(Boolean)
)
const demoIdSet = computed(() => new Set(demoIds.value))
onMounted(() => {
  isMounted.value = true
})

function selectKitchen(id: string, source: KitchenFetchSource) {
  const kitchenId = String(id ?? '').trim()
  if (source === 'demo' && !demoIdSet.value.has(kitchenId)) return
  if (source === 'live' && !consoleIdSet.value.has(kitchenId)) return
  emit('select', kitchenId, source)
}
</script>
