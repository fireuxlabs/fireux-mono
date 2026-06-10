<template>
  <ProjectCollectionManager
    :collection="collection"
    :console-ids="consoleIds"
    v-model:filter-mode="liveMode"
    :filter-options="liveModeOptions"
    :show-filter-toggle="true"
    title="Choose Project"
    description="Select the project you want to work on."
    :link="false"
    :action="true"
    :show-badges="false"
    @select="emit('select', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

type LiveMode = 'console' | 'mine'

const props = withDefaults(
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

const liveMode = ref<LiveMode>('console')
const liveModeOptions = [
  { value: 'console' as const, label: 'Project consoles' },
  { value: 'mine' as const, label: 'My projects' },
]
const consoleIds = computed(() =>
  props.collection
    .map((project) => String(project.id ?? '').trim())
    .filter(Boolean)
)
</script>
