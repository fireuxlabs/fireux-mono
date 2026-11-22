<template>
  <WorkspaceTeamSingle
    v-if="memberId"
    :key="`member:${workspaceId}:${memberId}`"
    ref="crud"
    editing
    :members="state.team.members"
    :selected-member-id="memberId"
    :available="derived.capability.availableActions"
    :update-member="primitives.update"
    @request-remove="removal?.prepare($event)"
  >
    <slot name="single" />
  </WorkspaceTeamSingle>
  <WorkspaceCapability v-else :key="workspaceId" collection-label="Team">
    <template #collection-panel>
      <WorkspaceTeamCollection
        ref="collection"
        :team="team"
        :title="title"
        :error="error"
        :role-labels="roleLabels"
      />
    </template>
    <template #single-panel>
      <WorkspaceTeamSingle
        :key="state.team.selectedTeamMemberId"
        ref="crud"
        :to="memberPath?.(state.team.selectedTeamMemberId)"
        :roles="roleLabels?.[state.team.selectedTeamMemberId]"
        :members="state.team.members"
        :selected-member-id="state.team.selectedTeamMemberId"
        :available="derived.capability.availableActions"
        :update-member="primitives.update"
        @request-remove="removal?.prepare($event)"
        ><slot name="single"
      /></WorkspaceTeamSingle>
    </template>
  </WorkspaceCapability>
  <UModal v-model:open="readOpen" title="Team members">
    <template #body>
      <WorkspaceTeamCollection
        v-if="readOpen && canRead"
        read-only
        :team="team"
        :title="title"
        :error="error"
        :role-labels="roleLabels"
        :member-path="memberPath"
        @select="readOpen = false"
      />
    </template>
  </UModal>
  <WorkspaceTeamCrudRemove ref="removal" :team="team" :member-id="memberId" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WorkspaceTeamSingle from './Single.vue'
import WorkspaceTeamCollection from './Collection.vue'
import WorkspaceTeamCrudRemove from './Crud/Remove.vue'
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
  memberPath?: (memberId: string) => string
  team: TeamContext
}>()
const { workspaceId, state, derived, primitives } = props.team
const collection = ref<InstanceType<typeof WorkspaceTeamCollection>>()
const crud = ref<InstanceType<typeof WorkspaceTeamSingle>>()
const removal = ref<InstanceType<typeof WorkspaceTeamCrudRemove>>()
const readOpen = ref(false)
const canRead = computed(
  () => derived.value.capability.primitives.read.available
)
watch(
  [workspaceId, canRead],
  () => {
    readOpen.value = false
  },
  { flush: 'sync' }
)
defineExpose({
  openAction: (intent: TeamAIIntent) => {
    if (
      intent.action === 'none' ||
      !derived.value.capability.primitives[intent.action].available
    )
      return
    if (intent.action === 'create') {
      collection.value?.openCreate(intent.name)
    } else if (intent.action === 'read') {
      readOpen.value = true
    } else if (intent.action === 'delete') {
      removal.value?.prepare(
        props.memberId || state.value.team.selectedTeamMemberId
      )
    } else if (intent.action === 'update') {
      crud.value?.prepareUpdate(intent.name)
    }
  },
})
</script>
