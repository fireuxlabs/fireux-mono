<template>
  <WorkspaceCrudToolbar
    label="Project Team"
    :available="derived.hasSelection ? ['read'] : []"
    @read="actions.refresh"
  />
</template>

<script setup lang="ts">
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

defineProps<{
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()
</script>
