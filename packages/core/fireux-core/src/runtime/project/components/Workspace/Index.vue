<template>
  <WorkspaceProjectOnboarding
    v-if="derived.outcome === 'empty' && derived.canCreate"
  />
  <WorkspaceProjectSelector
    v-if="derived.outcome === 'ready' && state.projects.length > 1"
    :projects="state.projects"
    :selected-project-id="state.project.id"
  />
</template>

<script setup lang="ts">
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from '../../composables/workspace/index/useProjectWorkspaceIndex'

defineProps<{
  state: ProjectWorkspaceIndexState
  derived: ProjectWorkspaceIndexDerived
}>()
</script>
