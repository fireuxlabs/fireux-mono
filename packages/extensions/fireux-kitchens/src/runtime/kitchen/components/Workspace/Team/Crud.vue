<template>
  <div>
    <WorkspaceTeamCrud
      ref="crud"
      label="Kitchen Team"
      :members="state.team.members"
      :selected-member-id="state.team.selectedTeamMemberId"
      :available="derived.capability.availableActions"
      route-base="/workspace/kitchen/team"
      update-description="Update the person’s name, job title and Kitchen access role. Account linking remains separate."
      delete-description="This revokes linked Kitchen access and pending invitations while preserving the member’s operational history."
      :update-member="updateMember"
      role-label="Access role"
      :role-options="roleOptions"
      :can-edit-role="(member) => member.role !== 'owner'"
      :deactivate-member="primitives.delete"
      @edit="beginEdit"
      @select="natives.select"
      @create="openCreate"
    >
      <template #edit-fields
        ><WorkspaceKitchenTeamJobTitle v-model="jobTitle"
      /></template>
    </WorkspaceTeamCrud>
    <WorkspaceKitchenTeamCrudCreate
      v-model:open="createOpen"
      :initial-name="createName"
      :initial-job-title="createJobTitle"
      :state="state"
      :derived="derived"
      @created="natives.selectCreated"
    />
  </div>
</template>

<script setup lang="ts">
import WorkspaceKitchenTeamJobTitle from './JobTitle.vue'
import { ref } from 'vue'
import WorkspaceTeamCrud from 'fireux-core/runtime/components/Workspace/Team/Crud.vue'
import type { KitchenTeamIntent } from '../../../models/team-onboarding'
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
    jobTitle: jobTitle.value,
    role: input.role as 'member' | 'operator' | undefined,
  })
}
const createOpen = ref(false)
const createName = ref('')
const createJobTitle = ref('')
const jobTitle = ref('')
function beginEdit(memberId: string) {
  jobTitle.value =
    state.value.team.members.find((member) => member.id === memberId)
      ?.jobTitle || ''
}
function openCreate() {
  createName.value = ''
  createJobTitle.value = ''
  createOpen.value = true
}
const crud = ref<InstanceType<typeof WorkspaceTeamCrud>>()
defineExpose({
  openAction: (intent: KitchenTeamIntent) => {
    if (intent.action === 'onboard') return
    if (
      intent.action === 'none' ||
      !derived.value.capability.primitives[intent.action].available
    )
      return
    if (intent.action === 'create') {
      createName.value = intent.name
      createJobTitle.value = intent.jobTitle ?? ''
      createOpen.value = true
    } else {
      crud.value?.openAction(intent)
      if (intent.action === 'update' && intent.jobTitle != null)
        jobTitle.value = intent.jobTitle
    }
  },
})
</script>
