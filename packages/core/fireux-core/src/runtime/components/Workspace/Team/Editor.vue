<template>
  <WorkspaceCapability collection-label="Team">
    <template #collection-panel>
      <WorkspaceTeamCollection ref="collection" :team="team">
        <slot name="collection" />
      </WorkspaceTeamCollection>
    </template>
    <template #selected-panel>
      <WorkspaceTeamIndividual
        ref="crud"
        :members="state.team.members"
        :selected-member-id="state.team.selectedTeamMemberId"
        :available="derived.capability.availableActions"
        :update-member="primitives.update"
        :remove-member="primitives.delete"
        ><slot name="selected"
      /></WorkspaceTeamIndividual>
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamIndividual from './Individual.vue'
import WorkspaceTeamCollection from './Collection.vue'
import WorkspaceCapability from '../Capability.vue'
import type {
  TeamAIIntent,
  TeamContext,
} from '../../../composables/fireux/useTeam'
const props = defineProps<{
  team: TeamContext
}>()
const { state, derived, primitives } = props.team
const collection = ref<InstanceType<typeof WorkspaceTeamCollection>>()
const crud = ref<InstanceType<typeof WorkspaceTeamIndividual>>()
defineExpose({
  openAction: (intent: TeamAIIntent) => {
    if (
      intent.action === 'none' ||
      !derived.value.capability.primitives[intent.action].available
    )
      return
    if (intent.action === 'create') {
      collection.value?.openCreate(intent.name)
    } else {
      crud.value?.openAction(intent)
    }
  },
})
</script>
