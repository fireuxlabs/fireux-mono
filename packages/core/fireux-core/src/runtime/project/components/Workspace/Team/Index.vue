<template>
  <section
    id="project-team-members"
    class="workspace-surface workspace-surface--compact"
    aria-label="Project Team"
  >
    <WorkspaceProjectTeamCrud ref="crud" :team="team">
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
    </WorkspaceProjectTeamCrud>
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
import WorkspaceProjectTeamCrud from './Crud.vue'
import type { ProjectTeamIntent } from '../../../models/team-intent'
import type { useProjectTeam } from '../../../composables/useProjectTeam'
const props = defineProps<{
  team: ReturnType<typeof useProjectTeam>
  roleLabels?: Record<string, string[]>
}>()
const { state, derived, natives } = props.team
const crud = ref<InstanceType<typeof WorkspaceProjectTeamCrud>>()
defineExpose({
  openAction: (intent: ProjectTeamIntent) => crud.value?.openAction(intent),
})
</script>
