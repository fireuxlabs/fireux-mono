<template>
  <section class="space-y-2">
    <pre>ConsolePropertyIndexDemo</pre>

    <PropertyCollectionManager
      :collection="collection"
      title="Demo Properties"
      description="Select a read-only Property demo target to inspect the console shape."
      :link="false"
      :action="true"
      :show-badges="true"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { Property } from '../../../../models/property.model'

withDefaults(
  defineProps<{
    collection?: Property[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
