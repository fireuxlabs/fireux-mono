<template>
  <UPageGrid
    aria-label="Team tools"
    class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"
  >
    <UPageCard
      :as="canCreateTeamMember ? 'button' : 'div'"
      :title="createTool.label"
      :description="createTool.description"
      :icon="createTool.icon"
      class="aspect-square text-left"
      :class="{ 'opacity-50': !canCreateTeamMember }"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      :spotlight="canCreateTeamMember"
      @click="canCreateTeamMember && performAction(createTool.id)"
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
        v-if="canCreateTeamMember"
        :kitchen-id="kitchenId"
        @cancel="addMemberOpen = false"
        @created="handleMemberCreated"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenTeamContext } from '../../../composables/workspace/team/useKitchenTeamContext'
import { useKitchenTeamTools } from '../../../composables/workspace/team/useKitchenTeamTools'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const { kitchenId, canCreateTeamMember } = useKitchenTeamContext()
const toast = useToast()
const tools = useKitchenTeamTools()
const createTool = tools.find(
  (candidate) => candidate.id === 'kitchen.team.create-member'
)!
const { activeToolId, performAction, closeTool } =
  useKitchenCapabilityTools('team')
const addMemberOpen = computed({
  get: () => activeToolId.value === createTool.id,
  set: (value: boolean) => {
    if (!value) closeTool()
  },
})
const handleMemberCreated = (result: { name: string }) => {
  addMemberOpen.value = false
  toast.add({
    title: `${result.name} added`,
    description: 'The new member is now part of this Kitchen team.',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
