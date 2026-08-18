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

      <div
        class="min-w-0 border-l border-default pl-3"
        role="toolbar"
        aria-label="Team tools"
      >
        <UNavigationMenu
          :items="toolGroups"
          orientation="horizontal"
          content-orientation="vertical"
          aria-label="Team CRUD tools"
        />
      </div>
    </div>

    <UModal
      v-model:open="addMemberOpen"
      title="Add team member"
      description="Add an operational person record. This does not grant Misebox or Console access."
      :ui="{ content: 'sm:max-w-lg' }"
    >
      <template #body>
        <ConsoleKitchenTeamWrite
          v-if="canWrite"
          :kitchen-id="kitchenId"
          @cancel="addMemberOpen = false"
          @created="handleMemberCreated"
        />
      </template>
    </UModal>

    <ConsoleKitchenTeamToolModal
      v-if="activeTool"
      :open="Boolean(activeTool)"
      :mode="activeTool"
      @update:open="handleToolOpen"
    />
  </section>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed, ref } from 'vue'
import { useKitchenConsoleTeam } from '../../../../composables/fireux/console/kitchen/team/useKitchenConsoleTeam'
import { useKitchenTeamTools } from '../../../../composables/fireux/console/kitchen/team/useKitchenTeamTools'

const addMemberOpen = ref(false)
const activeTool = ref<'update' | 'delete' | 'invite' | null>(null)
const { kitchenId, canWrite } = useKitchenConsoleTeam()
const toast = useToast()
const tools = useKitchenTeamTools()
const tool = (id: (typeof tools)[number]['id']) =>
  tools.find((candidate) => candidate.id === id)!
const toolGroups = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Create',
    icon: 'i-lucide-plus',
    children: [
      {
        ...tool('kitchen.team.create-member'),
        disabled: !canWrite.value,
        onSelect: () => {
          addMemberOpen.value = true
        },
      },
      {
        ...tool('kitchen.team.create-invitation'),
        disabled: !canWrite.value,
        onSelect: () => openTool('invite'),
      },
    ],
  },
  {
    label: 'Update',
    icon: 'i-lucide-pencil',
    children: [
      {
        ...tool('kitchen.team.update-member'),
        disabled: !canWrite.value,
        onSelect: () => openTool('update'),
      },
      {
        ...tool('kitchen.team.delete-member'),
        disabled: !canWrite.value,
        onSelect: () => openTool('delete'),
      },
    ],
  },
])
const openTool = (mode: NonNullable<typeof activeTool.value>) => {
  activeTool.value = mode
}
const handleToolOpen = (open: boolean) => {
  if (!open) activeTool.value = null
}
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
