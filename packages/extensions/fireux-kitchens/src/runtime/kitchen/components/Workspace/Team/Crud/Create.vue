<template>
  <UModal
    :open="open"
    title="Add team member"
    description="Add an operational person record. This does not grant Misebox or Workspace access."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceKitchenTeamWrite
        v-if="derived.canCreateTeamMember"
        :kitchen-id="state.kitchen.id"
        @cancel="emit('update:open', false)"
        @created="handleMemberCreated"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { useKitchenWorkspaceTeam } from '../../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  open: boolean
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
}>()

const toast = useToast()

function handleMemberCreated(result: { name: string }) {
  emit('update:open', false)
  toast.add({
    title: `${result.name} added`,
    description: 'The new member is now part of this Kitchen team.',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
