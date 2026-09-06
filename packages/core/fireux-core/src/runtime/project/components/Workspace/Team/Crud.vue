<template>
  <div>
    <WorkspaceTeamCrud
      :key="state.project.id"
      ref="crud"
      label="Project Team"
      :members="state.team.members"
      :selected-member-id="state.team.selectedTeamMemberId"
      :available="derived.capability.availableActions"
      route-base="/workspace/project/team"
      update-description="Update the person’s name, job title and Project access role. Linked User identity remains separate."
      delete-description="This removes the member from the active Project Team while preserving the record."
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
        ><WorkspaceProjectTeamJobTitle v-model="jobTitle"
      /></template>
    </WorkspaceTeamCrud>
    <WorkspaceProjectTeamCrudCreate
      v-model:open="createOpen"
      :state="state"
      :create="primitives.create"
      :initial-name="createName"
      :initial-job-title="createJobTitle"
      @created="natives.selectCreated"
    />
  </div>
</template>

<script setup lang="ts">
import WorkspaceProjectTeamJobTitle from './JobTitle.vue'
import { ref } from 'vue'
import WorkspaceTeamCrud from '../../../../components/Workspace/Team/Crud.vue'
import type { ProjectTeamIntent } from '../../../models/team-intent'
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>
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
const crud = ref<InstanceType<typeof WorkspaceTeamCrud>>()
function openCreate() {
  createName.value = ''
  createJobTitle.value = ''
  createOpen.value = true
}
function openAction(intent: ProjectTeamIntent) {
  if (
    intent.action === 'none' ||
    !derived.value.capability.availableActions.includes(intent.action)
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
}
defineExpose({ openAction })
</script>
