<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Project"
  >
    <WorkspaceProjectCrud
      :state="state"
      :derived="derived"
      :refresh="refresh"
    />
    <UAlert
      v-if="derived.status !== 'loading' && !state.project.id"
      color="neutral"
      variant="subtle"
      icon="i-lucide-briefcase-business"
      title="No Project selected"
      description="Create or select a Project to begin this Workspace."
    />
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
