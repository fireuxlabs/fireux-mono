<template>
  <UModal
    :open="open"
    title="Add team member"
    description="Find an existing User, or add an unlinked name when the person is not here yet."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceTeamCrudCreatePerson
        :create="create"
        :initial-name="initialName"
        @cancel="emit('update:open', false)"
        @created="handleCreated"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { useProjectWorkspaceTeam } from '../../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>
const props = defineProps<{
  open: boolean
  state: Workspace['state']['value']
  initialName?: string
  create: Workspace['primitives']['create']
}>()
const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'created', memberId: string): void
}>()
const toast = useToast()

function handleCreated(result: unknown) {
  const memberId = (result as { memberId: string }).memberId
  emit('update:open', false)
  emit('created', memberId)
  toast.add({
    title: 'Team member added',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
