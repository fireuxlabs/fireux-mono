<template>
  <section class="space-y-2">
    <pre>ConsoleProjectIndexDemo</pre>

    <ProjectCollectionManager
      :collection="collection"
      title="Demo Projects"
      description="Select a read-only Project demo target to inspect the console shape."
      :link="false"
      :action="true"
      :show-badges="true"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

withDefaults(
  defineProps<{
    collection?: ProjectSurface[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()
</script>
