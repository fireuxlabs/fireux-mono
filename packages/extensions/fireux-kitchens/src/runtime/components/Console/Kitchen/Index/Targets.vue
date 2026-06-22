<template>
  <section class="space-y-4">
    <p v-if="showLoading" class="text-sm text-dimmed">
      Loading kitchens...
    </p>

    <template v-else-if="targetCount">
      <ConsoleKitchenIndexTargetSection
        title="Your kitchens"
        description="Live kitchens linked to your current user profile."
        source="live"
        :collection="collection"
        :selected-id="selectedId"
        :selected-source="selectedSource"
        @select="selectKitchen"
      />

      <ConsoleKitchenIndexTargetSection
        title="Demo kitchens"
        description="Explore with our read-only kitchens."
        source="demo"
        :collection="demoCollection"
        :selected-id="selectedId"
        :selected-source="selectedSource"
        @select="selectKitchen"
      />
    </template>

    <p v-else-if="isMounted" class="text-sm text-dimmed">
      No Kitchen targets found.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { KitchenFetchSource } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
    demoCollection?: KitchenSurface[]
    pending?: boolean
    demoPending?: boolean
    selectedId?: string
    selectedSource?: KitchenFetchSource
  }>(),
  {
    collection: () => [],
    demoCollection: () => [],
    pending: false,
    demoPending: false,
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
const targetCount = computed(() =>
  props.collection.length + props.demoCollection.length
)
const sourcePending = computed(() =>
  props.pending || props.demoPending
)
const showLoading = computed(() =>
  !isMounted.value || (sourcePending.value && targetCount.value === 0)
)

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
