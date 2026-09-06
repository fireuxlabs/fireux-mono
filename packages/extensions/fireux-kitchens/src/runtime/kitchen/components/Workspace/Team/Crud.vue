<template>
  <div class="grid items-start gap-5 md:grid-cols-2">
    <div class="min-w-0">
      <slot name="collection" />
      <WorkspaceKitchenTeamCrudCreate
        v-model:open="createOpen"
        :initial-name="createName"
        :team="team"
      />
    </div>
    <UCard class="min-w-0" aria-label="Edit selected team member">
      <WorkspaceTeamCrud
        ref="crud"
        label="Kitchen Team"
        hide-access-role
        :members="state.team.members"
        :selected-member-id="state.team.selectedTeamMemberId"
        :available="derived.capability.availableActions"
        route-base="/workspace/kitchen/team"
        update-description="Update an unlinked person’s name."
        delete-description="This revokes linked Kitchen access and pending invitations while preserving the member’s operational history."
        :update-member="updateMember"
        role-label="Access role"
        :role-options="roleOptions"
        :can-edit-role="
          (member) => !['owner', 'developer'].includes(member.role)
        "
        :deactivate-member="primitives.delete"
        @select="natives.select"
        @create="openCreate"
      >
        <template #member-tools
          ><div class="my-5 space-y-4"><slot name="selected" /></div
        ></template>
      </WorkspaceTeamCrud>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
provide('workspace-team-open-plan', true)
import WorkspaceTeamCrud from 'fireux-core/runtime/components/Workspace/Team/Crud.vue'
import type { TeamAIIntent as KitchenTeamIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>
const props = defineProps<{ team: Workspace }>()
const { state, derived, primitives, natives } = props.team
const roleOptions = [
  { label: 'Team member', value: 'member' },
  { label: 'Operator', value: 'operator' },
]
async function updateMember(input: {
  memberId: string
  name: string
  role?: string
}) {
  if (
    input.role !== undefined &&
    input.role !== 'member' &&
    input.role !== 'operator'
  )
    throw new Error('Choose a valid access role.')
  return primitives.update({
    ...input,
    role: input.role as 'member' | 'operator' | undefined,
  })
}
const createOpen = ref(false)
const createName = ref('')
function openCreate() {
  createName.value = ''
  createOpen.value = true
}
const crud = ref<InstanceType<typeof WorkspaceTeamCrud>>()
defineExpose({
  openAction: (intent: KitchenTeamIntent) => {
    if (
      intent.action === 'none' ||
      !derived.value.capability.primitives[intent.action].available
    )
      return
    if (intent.action === 'create') {
      createName.value = intent.name
      createOpen.value = true
    } else {
      crud.value?.openAction(intent)
    }
  },
})
</script>
