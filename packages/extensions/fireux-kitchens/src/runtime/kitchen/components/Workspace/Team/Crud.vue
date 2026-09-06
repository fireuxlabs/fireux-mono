<template>
  <div>
    <slot name="block-heading" />
    <div class="grid items-start gap-5 md:grid-cols-2">
      <div class="min-w-0">
        <slot name="collection-heading" />
        <slot name="collection" />
        <WorkspaceKitchenTeamCrudCreate
          v-model:open="createOpen"
          :initial-name="createName"
          :team="team"
        />
      </div>
      <div class="min-w-0">
        <slot name="selected-heading" />
        <UCard aria-label="Edit selected team member">
          <WorkspaceTeamCrud
            ref="crud"
            label="Kitchen Team"
            :members="state.team.members"
            :selected-member-id="state.team.selectedTeamMemberId"
            :available="derived.capability.availableActions"
            route-base="/workspace/kitchen/team"
            update-description="Update an unlinked person’s name."
            delete-description="This revokes linked Kitchen access and pending invitations while preserving the member’s operational history."
            :update-member="updateMember"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
provide('workspace-team-open-plan', true)
import WorkspaceTeamCrud from 'fireux-core/runtime/components/Workspace/Team/Crud.vue'
import type { TeamAIIntent as KitchenTeamIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { useKitchenTeam } from '../../../composables/useKitchenTeam'

type Workspace = ReturnType<typeof useKitchenTeam>
const props = defineProps<{ team: Workspace }>()
const { state, derived, primitives, natives } = props.team
const updateMember = primitives.update
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
