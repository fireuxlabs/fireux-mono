<template>
  <LayoutsWorkspaceNavbar title="Project Workspace">
    <template
      v-if="derived.outcome === 'pending' || derived.hasSelection"
      #title
    >
      <WorkspaceProjectActive :project="state.project" />
    </template>
    <template #right>
      <WorkspaceProjectInfo />
    </template>
  </LayoutsWorkspaceNavbar>
</template>

<script setup lang="ts">
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'

defineProps<{
  state: Pick<ProjectWorkspaceIndexState, 'project'>
  derived: Pick<ProjectWorkspaceIndexDerived, 'outcome' | 'hasSelection'>
}>()
</script>
