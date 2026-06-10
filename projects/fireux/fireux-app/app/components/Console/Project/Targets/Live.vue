<template>
  <ProjectCollectionManager
    :collection="collection"
    title="Choose Project"
    description="Select the project you want to work on."
    :link="false"
    :action="true"
    :show-badges="false"
    @select="emit('select', $event)"
  />
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
