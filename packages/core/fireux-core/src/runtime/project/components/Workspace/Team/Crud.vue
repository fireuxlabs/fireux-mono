<template>
  <div>
    <WorkspaceTeamCrud
      label="Project Team"
      :members="state.team.members"
      :selected-member-id="state.team.selectedTeamMemberId"
      :available="derived.capability.availableActions"
      route-base="/workspace/project/team"
      update-description="Update the selected Project Team record. Linked User identity remains separate."
      delete-description="This removes the member from the active Project Team while preserving the record."
      :update-member="actions.updateTeamMember"
      :deactivate-member="actions.deactivateTeamMember"
      @create="createOpen = true"
    />
    <WorkspaceProjectTeamCrudCreate
      v-model:open="createOpen"
      :state="state"
      @created="actions.refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>
defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()
const createOpen = ref(false)
</script>
