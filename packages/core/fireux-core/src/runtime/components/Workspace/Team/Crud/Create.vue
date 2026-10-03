<template>
  <UModal
    :open="open"
    title="Add team member"
    description="Find an existing User, or add a name."
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceTeamCrudCreatePerson
        v-if="available"
        :create="create"
        :active="open"
        :initial-name="initialName"
        autofocus
        cancellable
        @cancel="emit('update:open', false)"
        @created="created"
      />
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import type { TeamContext } from '../../../../composables/fireux/useTeam'
const props = withDefaults(
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
  if (!props.open || !props.available) return
  const result = value as { memberId: string; name: string }
  emit('update:open', false)
  emit('created', result.memberId)
  toast.add({ title: `${result.name} added`, color: 'success' })
}
</script>
