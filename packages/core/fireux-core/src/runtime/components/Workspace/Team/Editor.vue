<template>
  <div>
    <slot name="block-heading" />
    <WorkspaceCapability collection-label="Team">
      <template #collection-heading
        ><slot name="collection-heading"
          ><h2 class="font-semibold">Team</h2></slot
        ></template
      >
      <template #collection-tools
        ><UButton
          icon="i-lucide-plus"
          label="Create"
          size="sm"
          :disabled="!derived.capability.primitives.create.available"
          @click="openCreate"
      /></template>
      <template #collection>
        <slot name="collection" />
        <WorkspaceTeamCrudCreate
          v-model:open="createOpen"
          :initial-name="createName"
          :create="primitives.create"
          :available="derived.capability.primitives.create.available"
        />
      </template>
      <template #selected-heading
        ><slot name="selected-heading"
          ><h2 class="font-semibold">In focus</h2></slot
        ></template
      >
      <template #selected>
        <UCard aria-label="Edit selected team member">
          <WorkspaceTeamCrud
            ref="crud"
            :label="label"
            :members="state.team.members"
            :selected-member-id="state.team.selectedTeamMemberId"
            :available="derived.capability.availableActions"
            :route-base="routeBase"
            update-description="Update an unlinked person’s name."
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
      </template>
    </WorkspaceCapability>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
provide('workspace-team-open-plan', true)
import WorkspaceTeamCrud from './Crud.vue'
import WorkspaceCapability from '../Capability.vue'
import type {
  TeamAIIntent,
  TeamContext,
} from '../../../composables/fireux/useTeam'
const props = defineProps<{
  team: TeamContext
  label: string
  routeBase: string
}>()
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
    } else {
      crud.value?.openAction(intent)
    }
  },
})
</script>
