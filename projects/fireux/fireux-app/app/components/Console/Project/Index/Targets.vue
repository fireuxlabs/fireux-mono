<template>
  <section class="space-y-2">
    <pre>ConsoleProjectIndexTargets</pre>

    <ProjectCollectionManager
      :collection="collection"
      :pending="pending"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
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
import { computed } from 'vue'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const props = withDefaults(
  defineProps<{
    collection?: ProjectSurface[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

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
