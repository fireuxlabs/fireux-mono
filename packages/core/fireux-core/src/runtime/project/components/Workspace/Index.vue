<template>
  <section class="flex items-center gap-2" aria-label="Project controls">
    <WorkspaceProjectSelector
      v-if="state.projects.length"
      :projects="state.projects"
      :selected-entity-id="state.project.id"
      :primary-project-id="state.user.primaryProject"
      :can-select-multiple="derived.canSelectMultiple"
      :refresh="refresh"
    />
    <WorkspaceProjectCreate v-if="derived.canCreate" :refresh="refresh" />
  </section>
</template>

<script setup lang="ts">
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from '../../composables/workspace/index/useProjectWorkspaceIndex'

defineProps<{
  state: ProjectWorkspaceIndexState
  derived: ProjectWorkspaceIndexDerived
  refresh: () => Promise<unknown>
}>()
</script>
