<template>
  <WorkspaceTeamDialog
    :open="open"
    title="Add team member"
    description="Find an existing Misebox User, or add an unlinked name when the person is not here yet."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceTeamCrudCreatePerson
        v-if="team.derived.value.capability.primitives.create.available"
        :create="team.primitives.create"
        :initial-name="initialName"
        @cancel="emit('update:open', false)"
        @created="handleMemberCreated"
      />
    </template>
  </WorkspaceTeamDialog>
</template>

<script setup lang="ts">
import WorkspaceTeamDialog from 'fireux-core/runtime/components/Workspace/Team/Dialog.vue'
import type { useKitchenTeam } from '../../../../composables/useKitchenTeam'

type Workspace = ReturnType<typeof useKitchenTeam>

const props = defineProps<{
  initialName?: string
  open: boolean
  team: Workspace
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'created', memberId: string): void
}>()

const toast = useToast()

function handleMemberCreated(value: unknown) {
  const result = value as { memberId: string; name: string }
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
