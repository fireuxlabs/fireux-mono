<template>
  <section
    id="supplier-team-members"
    class="workspace-surface workspace-surface--compact"
    aria-label="Supplier Team"
  >
    <WorkspaceTeamEditor :team="team">
      <template #collection>
        <UAlert
          v-if="derived.status === 'error'"
          title="Supplier Team could not be loaded"
          color="error"
        >
          <template #description>
            {{ team.error.value?.message }}
            <MoleculesCopyError
              :message="
                team.error.value?.message ||
                'Supplier Team could not be loaded.'
              "
            />
          </template>
        </UAlert>
        <WorkspaceTeamPeople
          v-else
          :members="state.team.members"
          :role-labels="roleLabels"
          :selected-id="state.team.selectedTeamMemberId"
          :pending="derived.status === 'loading'"
          @select="natives.select"
        />
      </template>
      <template #single>
        <WorkspaceTeamAssignment
          :editor="rolesEditor"
          :member-id="state.team.selectedTeamMemberId"
        />
      </template>
    </WorkspaceTeamEditor>
    <UAlert
      v-if="derived.status === 'ready' && !state.team.members.length"
      title="No team members yet"
      description="Add the first person to begin this Supplier Team."
    />
    <WorkspaceTeamRoles
      ref="rolesEditor"
      compact
      class="rounded-xl border border-default p-4"
      @labels="updateLabels"
      v-if="derived.status === 'ready'"
      :workspace-id="state.supplier.id"
      :member-id="state.team.selectedTeamMemberId"
      :member-name="
        state.team.members.find(
          (member) => member.id === state.team.selectedTeamMemberId
        )?.name
      "
      endpoint="/api/workspace/supplier/team/roles"
      :suggestions="['Owner', 'Sales', 'Purchasing', 'Warehouse', 'Delivery']"
    />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamPeople from 'fireux-core/runtime/workspace/components/Team/People.vue'
import WorkspaceTeamEditor from 'fireux-core/runtime/workspace/components/Team/Editor.vue'
import type { useSupplierTeam } from '../../../composables/useSupplierTeam'
import WorkspaceTeamRoles from 'fireux-core/runtime/workspace/components/Team/Roles.vue'
import WorkspaceTeamAssignment from 'fireux-core/runtime/workspace/components/Team/Assignment.vue'

const props = defineProps<{
  team: ReturnType<typeof useSupplierTeam>
}>()
const { state, derived, natives } = props.team
const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})
function updateLabels(labels: Record<string, string[]>) {
  roleLabels.value = labels
  void props.team.refresh()
}
</script>
