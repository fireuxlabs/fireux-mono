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
        :create="createPerson"
        @cancel="emit('update:open', false)"
        @created="handleCreated"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useRequireUser } from '../../../../../composables/fireux/firebase/useRequireUser'
import type { useProjectWorkspaceTeam } from '../../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>
const props = defineProps<{
  open: boolean
  state: Workspace['state']['value']
}>()
const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'created'): void
}>()
const toast = useToast()

async function createPerson(person: { name: string; userId?: string }) {
  const user = await useRequireUser()
  return $fetch(
    `/api/internal/control/projects/${encodeURIComponent(props.state.project.id)}/team`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
      body: person,
    }
  )
}
function handleCreated() {
  emit('update:open', false)
  emit('created')
  toast.add({
    title: 'Team member added',
    color: 'success',
    icon: 'i-lucide-user-check',
  })
}
</script>
