<template>
  <section
    id="project-team-members"
    class="workspace-surface workspace-surface--compact"
    aria-label="Project Team"
  >
    <WorkspaceTeamEditor
      :role-labels="roleLabels"
      :title="collectionTitle"
      ref="crud"
      :team="team"
      :member-id="memberId"
      :single-path="selectedPath"
    >
      <template #collection>
        <UAlert
          v-if="derived.status === 'error'"
          title="Project Team could not be loaded"
          color="error"
        />
        <WorkspaceTeamPeople
          v-else
          :members="state.team.members"
          :role-labels="roleLabels"
          :selected-id="selectedId"
          :pending="derived.status === 'loading'"
          @select="natives.select"
        />
      </template>
      <template #single>
        <WorkspaceTeamAssignment
          :editor="rolesEditor"
          :member-id="selectedId"
        />
      </template>
    </WorkspaceTeamEditor>
    <UAlert
      v-if="derived.status === 'ready' && !state.team.members.length"
      title="No team members yet"
      description="Add the first person to begin this Project Team."
    />
    <WorkspaceTeamRoles
      ref="rolesEditor"
      compact
      class="rounded-xl border border-default p-4"
      :workspace-name="state.project.name"
      @labels="roleLabels = $event"
      v-if="derived.status === 'ready'"
      :workspace-id="state.project.id"
      :member-id="selectedId"
      :member-name="
        state.team.members.find((member) => member.id === selectedId)?.name
      "
      :endpoint="`/api/internal/control/projects/${encodeURIComponent(state.project.id)}/roles`"
      :suggestions="[
        'Owner',
        'Project Manager',
        'Designer',
        'Contributor',
        'Tester',
      ]"
    />
  </section>
</template>
<script setup lang="ts">
import { useProjectIdentity } from '../../../composables/useProjectIdentity'
const workspaceIdentity = useProjectIdentity()
const collectionTitle = computed(() =>
  workspaceIdentity.name.value
    ? `${workspaceIdentity.name.value}’s Team`
    : 'Team'
)

import { computed, ref } from 'vue'
import WorkspaceTeamPeople from '../../../../components/Workspace/Team/People.vue'
import WorkspaceTeamEditor from '../../../../components/Workspace/Team/Editor.vue'
import type { TeamAIIntent } from '../../../../composables/fireux/useTeam'
import type { useProjectTeam } from '../../../composables/useProjectTeam'
import WorkspaceTeamRoles from '../../../../components/Workspace/Team/Roles.vue'
import WorkspaceTeamAssignment from '../../../../components/Workspace/Team/Assignment.vue'

const props = defineProps<{
  memberId?: string
  team: ReturnType<typeof useProjectTeam>
}>()
const { state, derived, natives } = props.team
const selectedId = computed(
  () => props.memberId || state.value.team.selectedTeamMemberId
)
const selectedPath = computed(
  () => `/workspace/project/team/${encodeURIComponent(selectedId.value)}`
)

const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})
const crud = ref<InstanceType<typeof WorkspaceTeamEditor>>()
defineExpose({
  openAction: (intent: TeamAIIntent) => crud.value?.openAction(intent),
})
</script>
