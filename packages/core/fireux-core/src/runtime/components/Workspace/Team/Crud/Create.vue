<template>
  <WorkspaceTeamDialog
    :open="open"
    title="Add team member"
    description="Find an existing User, or add a name."
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceTeamCrudCreatePerson
        v-if="available"
        :create="create"
        :initial-name="initialName"
        @cancel="emit('update:open', false)"
        @created="created"
      />
    </template>
  </WorkspaceTeamDialog>
</template>
<script setup lang="ts">
import WorkspaceTeamDialog from '../Dialog.vue'
import type { TeamContext } from '../../../../composables/fireux/useTeam'
withDefaults(
  defineProps<{
    open: boolean
    initialName?: string
    available?: boolean
    create: TeamContext['primitives']['create']
  }>(),
  { available: true }
)
const emit = defineEmits<{ 'update:open': [boolean]; created: [string] }>()
const toast = useToast()
function created(value: unknown) {
  const result = value as { memberId: string; name: string }
  emit('update:open', false)
  emit('created', result.memberId)
  toast.add({ title: `${result.name} added`, color: 'success' })
}
</script>
