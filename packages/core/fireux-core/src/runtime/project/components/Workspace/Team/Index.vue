<template>
  <section
    id="project-team-members"
    class="workspace-surface workspace-surface--compact"
    aria-label="Project Team"
  >
    <WorkspaceTeamEditor label="Project Team" route-base="/workspace/project/team" ref="crud" :team="team">
      <template #collection>
        <WorkspaceTeamPeople
          :members="state.team.members"
          :role-labels="roleLabels"
          :selected-id="state.team.selectedTeamMemberId"
          :pending="derived.status === 'loading'"
          @select="natives.select"
        />
      </template>
      <template #selected><slot name="person-roles" /></template>
    </WorkspaceTeamEditor>
    <UAlert v-if="derived.status === 'ready' && !state.team.members.length" title="No team members yet" description="Add the first person to begin this Project Team." />
    <UAlert
      v-if="derived.status === 'error'"
      title="Project Team could not be loaded"
      color="error"
    />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamPeople from '../../../../components/Workspace/Team/People.vue'
import WorkspaceTeamEditor from '../../../../components/Workspace/Team/Editor.vue'
import type { TeamAIIntent } from '../../../../composables/fireux/useTeam'
import type { useProjectTeam } from '../../../composables/useProjectTeam'
const props = defineProps<{
  team: ReturnType<typeof useProjectTeam>
  roleLabels?: Record<string, string[]>
}>()
const { state, derived, natives } = props.team
const crud = ref<InstanceType<typeof WorkspaceTeamEditor>>()
defineExpose({
  openAction: (intent: TeamAIIntent) => crud.value?.openAction(intent),
})
</script>
