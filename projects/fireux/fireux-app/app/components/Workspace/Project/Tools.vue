<template>
  <WorkspaceEntityTools :tools="entityTools">
    <UPageCard
      title="Production Readiness Review"
      description="Test-now hypothesis; not yet an implemented Tool."
      icon="i-lucide-shield-check"
      to="/search-demand"
      class="aspect-square"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      spotlight
    />
  </WorkspaceEntityTools>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{
  state: ProjectWorkspaceIndexState
  derived: ProjectWorkspaceIndexDerived
}>()

const entityTools = computed(() => {
  if (props.derived.status === 'loading') return []
  const tools = []
  if (props.state.project.id) {
    tools.push({
      id: 'project.view',
      label: 'View Project',
      description: 'Open the primary Project.',
      icon: 'i-lucide-eye',
      to: '#workspace-entity-controls',
    })
  }
  if (props.derived.capability.primitives.create.available) {
    tools.push({
      id: 'project.create',
      label: 'Create Project',
      description: 'Create and select a Project.',
      icon: 'i-lucide-plus',
      to: '#workspace-entity-controls',
    })
  }
  if (props.state.appUser.projects.length > 1) {
    tools.push({
      id: 'project.change-primary',
      label: 'Change primary Project',
      description: 'Choose the Workspace Project.',
      icon: 'i-lucide-list-checks',
      to: '#workspace-entity-controls',
    })
  }
  return tools
})
</script>
