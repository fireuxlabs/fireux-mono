<template>
  <UCard>
    <template #header>Team roster</template>
    <p>Organise people who work with your business. Roster entries do not grant account access.</p>
    <WorkspaceTeamEditor :team="team" :role-labels="{}" :error="team.error.value?.message" />
  </UCard>
</template>
<script setup lang="ts">
import WorkspaceTeamEditor from 'fireux-core/runtime/workspace/components/Team/Editor.vue'
import { useBusinessWorkspaceTeam } from '../../composables/useBusinessWorkspaceTeam'
const team = useBusinessWorkspaceTeam()
</script>
