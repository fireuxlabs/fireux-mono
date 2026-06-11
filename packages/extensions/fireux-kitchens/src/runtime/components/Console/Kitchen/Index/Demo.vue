<template>
  <section class="space-y-2">
    <pre>ConsoleKitchenIndexDemo</pre>

    <KitchenCollectionManager
      :collection="collection"
      title="Demo Kitchens"
      description="Select a read-only Kitchen demo target to inspect the console shape."
      :link="false"
      :action="true"
      :show-badges="true"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

withDefaults(
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
</script>
