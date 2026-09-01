<template>
  <UPageGrid
    aria-label="Team tools"
    class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"
  >
    <UPageCard
      :as="derived.canCreateTeamMember ? 'button' : 'div'"
      :title="createTool.label"
      :description="createTool.description"
      :icon="createTool.icon"
      class="aspect-square text-left"
      :class="{ 'opacity-50': !derived.canCreateTeamMember }"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      :spotlight="derived.canCreateTeamMember"
      @click="derived.canCreateTeamMember && actions.openCreateTeamMember()"
    />
  </UPageGrid>

  <UModal
    v-model:open="addMemberOpen"
    title="Add team member"
    description="Add an operational person record. This does not grant Misebox or Workspace access."
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <WorkspaceKitchenTeamWrite
        v-if="derived.canCreateTeamMember"
        :kitchen-id="state.kitchen.id"
        @cancel="addMemberOpen = false"
        @created="handleMemberCreated"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenTeamTools } from '../../../composables/workspace/team/useKitchenTeamTools'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const toast = useToast()
const tools = useKitchenTeamTools()
const createTool = tools.find(
  (candidate) => candidate.id === 'kitchen.team.create-member'
)!
const addMemberOpen = computed({
  get: () => props.state.team.activeToolId === createTool.id,
  set: (value: boolean) => {
    if (!value) props.actions.closeCreateTeamMember()
  },
})
const handleMemberCreated = (result: { name: string }) => {
  props.actions.closeCreateTeamMember()
  toast.add({
    title: `${result.name} added`,
    description: 'The new member is now part of this Kitchen team.',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
