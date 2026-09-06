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
    <WorkspaceKitchenTeamCrudCreate v-model:open="createOpen" :team="team" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useKitchenTeam } from '../../../composables/useKitchenTeam'

type Workspace = ReturnType<typeof useKitchenTeam>
const props = defineProps<{ team: Workspace }>()
const { state, derived, natives } = props.team
const createOpen = ref(false)
</script>
