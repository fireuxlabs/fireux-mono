<template>
  <section class="space-y-2">
    <pre>ConsoleKitchenIndexTargets</pre>

    <KitchenCollectionManager
      :collection="collection"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
      title="Choose Kitchen"
      description="Select the Kitchen console target you want to work on."
      :link="false"
      :action="true"
      :show-badges="false"
      @select="selectKitchen"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
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
    .map((kitchen) => String(kitchen.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
function selectKitchen(id: string) {
  const kitchenId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(kitchenId)) return
  emit('select', kitchenId)
}
</script>
