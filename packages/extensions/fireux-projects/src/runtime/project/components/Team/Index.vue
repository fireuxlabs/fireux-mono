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
      :member-path="memberPath"
    >
      <template #single>
        <WorkspaceTeamAssignment
          :editor="rolesEditor"
          :member-id="selectedId"
        />
      </template>
    </WorkspaceTeamEditor>
    <WorkspaceTeamRoles
      ref="rolesEditor"
      compact
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
import { computed, ref } from 'vue'
import WorkspaceTeamEditor from 'fireux-core/runtime/workspace/components/Team/Editor.vue'
import type { TeamAIIntent } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import type { useProjectWorkspaceTeam } from '../../composables/workspace/useProjectWorkspaceTeam'
import WorkspaceTeamRoles from 'fireux-core/runtime/workspace/components/Team/Roles.vue'
import WorkspaceTeamAssignment from 'fireux-core/runtime/workspace/components/Team/Assignment.vue'

const props = defineProps<{
  memberId?: string
  team: ReturnType<typeof useProjectWorkspaceTeam>
}>()
const { state, derived } = props.team
const collectionTitle = computed(() =>
  state.value.project.name ? `${state.value.project.name}’s Team` : 'Team'
)
const selectedId = computed(
  () => props.memberId || state.value.team.selectedTeamMemberId
)
const memberPath = (id: string) =>
  `/workspace/project/team/${encodeURIComponent(id)}`

const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})
const crud = ref<InstanceType<typeof WorkspaceTeamEditor>>()
defineExpose({
  openAction: (intent: TeamAIIntent) => crud.value?.openAction(intent),
})
</script>
