<template>
  <div>
    <WorkspaceTeamSelector
      label="Project Team"
      :members="state.team.members"
      :selected-member-id="state.team.selectedTeamMemberId"
      :can-create="derived.capability.primitives.create.available"
      @select="natives.select"
      @create="createOpen = true"
    />
    <WorkspaceProjectTeamCrudCreate v-model:open="createOpen" :state="state" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>
const props = defineProps<{ team: Workspace }>()
const { state, derived, natives } = props.team
const createOpen = ref(false)
</script>
