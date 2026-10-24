<template>
  <WorkspaceTeamSingle
    v-if="memberId"
    :key="workspaceId"
    ref="crud"
    editing
    :members="state.team.members"
    :selected-member-id="memberId"
    :available="derived.capability.availableActions"
    :update-member="primitives.update"
    :remove-member="primitives.delete"
  >
    <slot name="single" />
  </WorkspaceTeamSingle>
  <WorkspaceCapability v-else :key="workspaceId" collection-label="Team">
    <template #collection-panel>
      <WorkspaceTeamCollection ref="collection" :team="team" :title="title">
        <slot name="collection">
          <UAlert
            v-if="derived.status === 'error'"
            title="Team could not be loaded"
            color="error"
            :description="error || 'Check your connection and try again.'"
          >
            <template #actions>
              <MoleculesCopyError
                :message="
                  error ||
                  'Team could not be loaded. Check your connection and try again.'
                "
              />
            </template>
          </UAlert>
          <WorkspaceTeamPeople
            v-else
            :members="state.team.members"
            :role-labels="roleLabels"
            :selected-id="memberId || state.team.selectedTeamMemberId"
            :pending="derived.status === 'loading'"
            @select="team.natives.select"
          />
          <p
            v-if="derived.status === 'ready' && !state.team.members.length"
            class="text-sm text-muted"
            role="status"
          >
            No team members yet. Add the first person to begin.
          </p>
        </slot>
      </WorkspaceTeamCollection>
    </template>
    <template #single-panel>
      <WorkspaceTeamSingle
        ref="crud"
        :to="singlePath"
        :roles="roleLabels?.[state.team.selectedTeamMemberId]"
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
import WorkspaceTeamPeople from './People.vue'
import WorkspaceTeamCollection from './Collection.vue'
import WorkspaceCapability from '../Capability.vue'
import type {
  TeamAIIntent,
  TeamContext,
} from '../../composables/useWorkspaceTeam'
const props = defineProps<{
  roleLabels?: Record<string, string[]>
  title?: string
  error?: string
  memberId?: string
  singlePath?: string
  team: TeamContext
}>()
const { workspaceId, state, derived, primitives } = props.team
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
