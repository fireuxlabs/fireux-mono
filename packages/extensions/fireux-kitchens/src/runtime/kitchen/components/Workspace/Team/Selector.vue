<template>
  <div>
    <WorkspaceTeamSelector
      label="Kitchen Team"
      :members="state.team.members"
      :selected-member-id="state.team.selectedTeamMemberId"
      :can-create="derived.capability.primitives.create.available"
      @select="natives.select"
      @create="createOpen = true"
    />
    <WorkspaceKitchenTeamCrudCreate
      v-model:open="createOpen"
      :state="state"
      :derived="derived"
      @created="natives.refresh"
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
  natives: Workspace['natives']
}>()
const createOpen = ref(false)
</script>
