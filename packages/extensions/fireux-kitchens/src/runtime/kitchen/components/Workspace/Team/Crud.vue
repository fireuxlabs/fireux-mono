<template>
  <div>
    <WorkspaceTeamCrud
      ref="crud"
      label="Kitchen Team"
      :members="state.team.members"
      :selected-member-id="state.team.selectedTeamMemberId"
      :available="derived.capability.availableActions"
      route-base="/workspace/kitchen/team"
      update-description="Update the person’s name and Kitchen responsibility. Account linking remains separate."
      delete-description="This revokes linked Kitchen access and pending invitations while preserving the member’s operational history."
      :update-member="primitives.update"
      :deactivate-member="primitives.delete"
      @select="natives.select"
      @create="openCreate"
    />
    <WorkspaceKitchenTeamCrudCreate
      v-model:open="createOpen"
      :initial-name="createName"
      :state="state"
      :derived="derived"
      @created="natives.selectCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamCrud from 'fireux-core/runtime/components/Workspace/Team/Crud.vue'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>
const props = defineProps<{ team: Workspace }>()
const { state, derived, primitives, natives } = props.team
const createOpen = ref(false)
const createName = ref('')
function openCreate() {
  createName.value = ''
  createOpen.value = true
}
const crud = ref<InstanceType<typeof WorkspaceTeamCrud>>()
defineExpose({
  openAction: (intent: TeamAIIntent) => {
    if (
      intent.action === 'none' ||
      !derived.value.capability.primitives[intent.action].available
    )
      return
    if (intent.action === 'create') {
      createName.value = intent.name
      createOpen.value = true
    } else crud.value?.openAction(intent)
  },
})
</script>
