<template>
  <section class="space-y-4">
    <p v-if="showLoading" class="text-sm text-dimmed">
      Loading kitchens...
    </p>

    <template v-else-if="targetCount">
      <ConsoleKitchenIndexTargetSection
        title="Your kitchens"
        description="Kitchens linked to your current user profile."
        :collection="standardKitchens"
        @select="selectKitchen"
      />

      <ConsoleKitchenIndexTargetSection
        title="Demo kitchens"
        description="Local test targets for building console flows."
        :collection="demoKitchens"
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
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
    demoTargetIds?: string[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    demoTargetIds: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const isMounted = ref(false)
const consoleIds = computed(() =>
  props.collection
    .map((kitchen) => String(kitchen.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
const demoIdSet = computed(() =>
  new Set(
    props.demoTargetIds
      .map((id) => String(id ?? '').trim())
      .filter(Boolean)
  )
)
const targetCount = computed(() => props.collection.length)
const demoKitchens = computed(() =>
  props.collection.filter((kitchen) =>
    demoIdSet.value.has(String(kitchen.id ?? '').trim())
  )
)
const standardKitchens = computed(() =>
  props.collection.filter(
    (kitchen) => !demoIdSet.value.has(String(kitchen.id ?? '').trim())
  )
)
const showLoading = computed(() => props.pending || !isMounted.value)

onMounted(() => {
  isMounted.value = true
})

function selectKitchen(id: string) {
  const kitchenId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(kitchenId)) return
  emit('select', kitchenId)
}
</script>
