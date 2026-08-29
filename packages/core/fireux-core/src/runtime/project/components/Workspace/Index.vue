<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Project controls"
  >
    <WorkspaceProjectSelector
      v-if="state.project.id || derived.canSelectMultiple"
      :project="state.project"
      :can-select-multiple="derived.canSelectMultiple"
      :project-ids="state.user.projects"
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
