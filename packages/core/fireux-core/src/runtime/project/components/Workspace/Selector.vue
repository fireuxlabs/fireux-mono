<template>
  <section aria-label="Project selector">
    <UTabs
      :model-value="selectedEntityId"
      :items="visibleItems"
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
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useWorkspace } from '../../../composables/fireux/workspace/useWorkspace'
import type { ProjectWorkspaceIndexState } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{
  projects: ProjectWorkspaceIndexState['projects']
  selectedEntityId: string
  primaryProjectId: string
  canSelectMultiple: boolean
  refresh: () => Promise<unknown>
}>()
const workspace = useWorkspace('project')
const { currentUser } = useAuth()
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
const visibleItems = computed(() => {
  if (props.canSelectMultiple) return items.value
  const primaryId = props.primaryProjectId || props.selectedEntityId
  return items.value.filter((item) => item.value === primaryId)
})

async function selectProject(projectId: string | number) {
  const project = props.projects.find((item) => item.id === projectId)
  if (!project) return
  const user = currentUser.value
  if (props.canSelectMultiple && user) {
    await $fetch('/api/internal/control/projects/primary', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { projectId: project.id },
    })
    await props.refresh()
  }
  workspace.activate(project.id, project.name, project.tagline, project.url)
}
</script>
