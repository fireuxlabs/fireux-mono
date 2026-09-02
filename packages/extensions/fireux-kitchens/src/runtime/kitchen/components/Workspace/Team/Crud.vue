<template>
  <div>
    <WorkspaceTeamCrud
      label="Kitchen Team"
      :members="state.team.members"
      :selected-member-id="state.team.selectedTeamMemberId"
      :available="derived.capability.availableActions"
      route-base="/workspace/kitchen/team"
      update-description="Update the person’s name and Kitchen responsibility. Account linking remains separate."
      delete-description="This revokes linked Kitchen access and pending invitations while preserving the member’s operational history."
      :update-member="actions.updateTeamMember"
      :deactivate-member="actions.deactivateTeamMember"
      @create="createOpen = true"
    />
    <WorkspaceKitchenTeamCrudCreate
      v-model:open="createOpen"
      :state="state"
      :derived="derived"
      @created="actions.refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>
defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()
const createOpen = ref(false)
</script>
