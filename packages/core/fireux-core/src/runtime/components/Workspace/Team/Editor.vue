<template>
  <WorkspaceCapability collection-label="Team">
    <template #collection-panel>
      <WorkspaceTeamCollection ref="collection" :team="team" :title="title">
        <slot name="collection" />
      </WorkspaceTeamCollection>
    </template>
    <template #single-panel>
      <WorkspaceTeamSingle
        ref="crud"
        :members="state.team.members"
        :selected-member-id="state.team.selectedTeamMemberId"
        :available="derived.capability.availableActions"
        :update-member="primitives.update"
        :remove-member="primitives.delete"
        ><slot name="single"
      /></WorkspaceTeamSingle>
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamSingle from './Single.vue'
import WorkspaceTeamCollection from './Collection.vue'
import WorkspaceCapability from '../Capability.vue'
import type {
  TeamAIIntent,
  TeamContext,
} from '../../../composables/fireux/useTeam'
const props = defineProps<{
  title?: string
  team: TeamContext
}>()
const { state, derived, primitives } = props.team
const collection = ref<InstanceType<typeof WorkspaceTeamCollection>>()
const crud = ref<InstanceType<typeof WorkspaceTeamSingle>>()
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
