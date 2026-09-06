<template>
  <div class="grid items-start gap-5 md:grid-cols-2">
    <div class="min-w-0">
      <slot name="collection" />
      <WorkspaceProjectTeamCrudCreate
        v-model:open="createOpen"
        :create="primitives.create"
        :initial-name="createName"
        @created="natives.selectCreated"
      />
    </div>
    <UCard aria-label="Edit selected team member">
      <WorkspaceTeamCrud
        ref="crud"
        label="Project Team"
        :members="state.team.members"
        :selected-member-id="state.team.selectedTeamMemberId"
        :available="derived.capability.availableActions"
        route-base="/workspace/project/team"
        update-description="Update the person’s name."
        delete-description="Remove this person from the team."
        :update-member="primitives.update"
        :remove-member="primitives.delete"
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
import WorkspaceTeamCrud from '../../../../components/Workspace/Team/Crud.vue'
import type { ProjectTeamIntent } from '../../../models/team-intent'
import type { useProjectTeam } from '../../../composables/useProjectTeam'
provide('workspace-team-open-plan', true)
const props = defineProps<{
  team: ReturnType<typeof useProjectTeam>
}>()
const { state, derived, primitives, natives } = props.team
const createOpen = ref(false)
const createName = ref('')
const crud = ref<InstanceType<typeof WorkspaceTeamCrud>>()
function openCreate() {
  createName.value = ''
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
    createOpen.value = true
  } else crud.value?.openAction(intent)
}
defineExpose({ openAction })
</script>
