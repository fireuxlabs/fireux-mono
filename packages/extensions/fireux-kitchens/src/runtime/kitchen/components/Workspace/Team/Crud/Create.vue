<template>
  <UModal
    :open="open"
    title="Add team member"
    description="Find an existing Misebox User, or add an unlinked name when the person is not here yet."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceKitchenTeamWrite
        v-if="derived.capability.primitives.create.available"
        :kitchen-id="state.kitchen.id"
        :initial-name="initialName"
        :initial-job-title="initialJobTitle"
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
  initialName?: string
  initialJobTitle?: string
  open: boolean
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'created', memberId: string): void
}>()

const toast = useToast()

function handleMemberCreated(result: { memberId: string; name: string }) {
  emit('update:open', false)
  emit('created', result.memberId)
  toast.add({
    title: `${result.name} added`,
    description: 'The new member is now part of this Kitchen team.',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
