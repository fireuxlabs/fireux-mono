<template>
  <WorkspaceTeamDialog
    :open="open"
    title="Add team member"
    description="Find an existing User, or add a name."
    @update:open="emit('update:open', $event)"
  >
    <template #body
      ><WorkspaceTeamCrudCreatePerson
        :create="create"
        :initial-name="initialName"
        @cancel="emit('update:open', false)"
        @created="handleCreated"
    /></template>
  </WorkspaceTeamDialog>
</template>
<script setup lang="ts">
import WorkspaceTeamDialog from '../../../../../components/Workspace/Team/Dialog.vue'
import type { useProjectTeam } from '../../../../composables/useProjectTeam'
defineProps<{
  open: boolean
  initialName?: string
  create: ReturnType<typeof useProjectTeam>['primitives']['create']
}>()
const emit = defineEmits<{ 'update:open': [boolean]; created: [string] }>()
function handleCreated(result: unknown) {
  emit('update:open', false)
  emit('created', (result as { memberId: string }).memberId)
}
</script>
