<template>
  <section
    id="blank-team-members"
    class="workspace-surface workspace-surface--compact"
    aria-label="Blank Team"
  >
    <WorkspaceTeamEditor
      :team="team"
      :role-labels="roleLabels"
      :error="team.error.value?.message"
    >
      <template #single>
        <WorkspaceTeamAssignment
          :editor="rolesEditor"
          :member-id="state.team.selectedTeamMemberId"
        />
      </template>
    </WorkspaceTeamEditor>
    <WorkspaceTeamRoles
      ref="rolesEditor"
      compact
      class="rounded-xl border border-default p-4"
      @labels="updateLabels"
      v-if="derived.status === 'ready'"
      :workspace-id="state.blank.id"
      :member-id="state.team.selectedTeamMemberId"
      :member-name="
        state.team.members.find(
          (member) => member.id === state.team.selectedTeamMemberId
        )?.name
      "
      endpoint="/api/workspace/blank/team/roles"
      :suggestions="[]"
    />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamEditor from 'fireux-core/runtime/workspace/components/Team/Editor.vue'
import type { useBlankTeam } from '../../../../composables/useBlankTeam'
import WorkspaceTeamRoles from 'fireux-core/runtime/workspace/components/Team/Roles.vue'
import WorkspaceTeamAssignment from 'fireux-core/runtime/workspace/components/Team/Assignment.vue'

const props = defineProps<{
  team: ReturnType<typeof useBlankTeam>
}>()
const { state, derived } = props.team
const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})
function updateLabels(labels: Record<string, string[]>) {
  roleLabels.value = labels
  void props.team.refresh()
}
</script>
