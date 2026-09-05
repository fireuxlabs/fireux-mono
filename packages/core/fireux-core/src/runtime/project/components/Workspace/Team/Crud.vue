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
      update-description="Update the selected Project Team record. Linked User identity remains separate."
      delete-description="This removes the member from the active Project Team while preserving the record."
      :update-member="primitives.update"
      :deactivate-member="primitives.delete"
      @select="natives.select"
      @create="openCreate"
    />
    <WorkspaceProjectTeamCrudCreate
      v-model:open="createOpen"
      :state="state"
      :create="primitives.create"
      :initial-name="createName"
      @created="natives.selectCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamCrud from '../../../../components/Workspace/Team/Crud.vue'
import type { TeamAIIntent } from '../../../../composables/fireux/workspace/useTeam'
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>
const props = defineProps<{ team: Workspace }>()
const { state, derived, primitives, natives } = props.team
const createOpen = ref(false)
const createName = ref('')
const crud = ref<InstanceType<typeof WorkspaceTeamCrud>>()
function openCreate() {
  createName.value = ''
  createOpen.value = true
}
function openAction(intent: TeamAIIntent) {
  if (
    intent.action === 'none' ||
    !derived.value.capability.availableActions.includes(intent.action)
  )
    return
  if (intent.action === 'create') {
    createName.value = intent.name
    createOpen.value = true
  } else crud.value?.openAction(intent)
}
defineExpose({ openAction })
</script>
