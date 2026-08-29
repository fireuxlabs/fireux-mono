<template>
  <section aria-label="Project selector">
    <UTabs
      :model-value="selectedEntityId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="selectProject"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspace } from '../../../composables/fireux/workspace/useWorkspace'
import type { ProjectWorkspaceIndexState } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{
  projects: ProjectWorkspaceIndexState['projects']
  selectedEntityId: string
}>()
const workspace = useWorkspace('project')
const items = computed(() =>
  props.projects.map((project) => ({
    label: project.name,
    value: project.id,
    avatar: {
      src: project.url || undefined,
      alt: project.name,
      icon: 'i-lucide-briefcase-business',
    },
  }))
)

function selectProject(projectId: string | number) {
  const project = props.projects.find((item) => item.id === projectId)
  if (!project) return
  workspace.activate(project.id)
}
</script>
