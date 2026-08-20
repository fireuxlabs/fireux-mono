<template>
  <section class="space-y-3" aria-labelledby="team-tools-title">
    <div
      class="flex items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2
          id="team-tools-title"
          class="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Tools
        </h2>
        <p class="hidden text-xs text-dimmed sm:block">Team actions</p>
      </div>

      <UButton
        :label="createTool.label"
        :icon="createTool.icon"
        :disabled="!canWrite"
        @click="addMemberOpen = true"
      />
    </div>

    <UModal
      v-model:open="addMemberOpen"
      title="Add team member"
      description="Add an operational person record. This does not grant Misebox or Workspace access."
      :ui="{ content: 'sm:max-w-lg' }"
    >
      <template #body>
        <WorkspaceKitchenTeamWrite
          v-if="canWrite"
          :kitchen-id="kitchenId"
          @cancel="addMemberOpen = false"
          @created="handleMemberCreated"
        />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'
import { useKitchenTeamTools } from '../../../composables/workspace/team/useKitchenTeamTools'

const addMemberOpen = ref(false)
const { kitchenId, canWrite } = useKitchenWorkspaceTeam()
const toast = useToast()
const tools = useKitchenTeamTools()
const createTool = tools.find(
  (candidate) => candidate.id === 'kitchen.team.create-member'
)!
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
