<template>
  <section class="space-y-2">
    <pre>ConsoleBlankIndexDemo</pre>

    <BlankCollectionManager
      :collection="collection"
      title="Demo Blanks"
      description="Select a read-only Blank demo target to inspect the console shape."
      :action="true"
      :show-badges="true"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { Blank } from '../../../../models/blank.model'

withDefaults(
  defineProps<{
    collection?: Blank[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
