<template>
  <div>
    <WorkspaceCrudToolbar
      label="Project Team"
      :available="available"
      @create="createOpen = true"
      @read="readOpen = true"
    />
    <WorkspaceProjectTeamCrudCreate
      v-model:open="createOpen"
      :state="state"
      @created="actions.refresh"
    />
    <WorkspaceProjectTeamCrudRead v-model:open="readOpen" :state="state" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceProjectTeamCrudRead from './Crud/Read.vue'
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const readOpen = ref(false)
const createOpen = ref(false)

const available = computed<Array<'create' | 'read' | 'update' | 'delete'>>(
  () => [
    ...(props.derived.status === 'ready' ? (['create'] as const) : []),
    ...(props.state.team.members.length ? (['read'] as const) : []),
    ...(props.derived.status === 'ready'
      ? (['update', 'delete'] as const)
      : []),
  ]
)
</script>
