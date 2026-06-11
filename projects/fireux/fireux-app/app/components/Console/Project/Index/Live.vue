<template>
  <section class="space-y-2">
    <pre>ConsoleProjectIndexLive</pre>

    <ProjectCollectionManager
      :collection="collection"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
      v-model:filter-mode="liveMode"
      :filter-options="liveModeOptions"
      :show-filter-toggle="true"
      title="Choose Project"
      description="Select the Project console target you want to work on."
      :link="false"
      :action="true"
      :show-badges="false"
      @select="selectProject"
    />
  </section>
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
const consoleIdSet = computed(() => new Set(consoleIds.value))
function selectProject(id: string) {
  const projectId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(projectId)) return
  emit('select', projectId)
}
</script>
