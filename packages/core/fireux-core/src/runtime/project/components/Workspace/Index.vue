<template>
  <section class="workspace-surface workspace-surface--compact" aria-label="Project">
    <WorkspaceProjectCrud
      :state="state"
      :derived="derived"
      :refresh="refresh"
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
