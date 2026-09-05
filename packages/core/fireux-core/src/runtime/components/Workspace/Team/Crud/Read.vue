<template>
  <UModal
    :open="open"
    :title="`Read ${label}`"
    description="Choose the team member to focus on."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="grid gap-2">
        <UButton
          v-for="member in members"
          :key="member.id"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="select(member.id)"
        >
          <UAvatar
            :src="member.avatar || undefined"
            :alt="member.name"
            :text="memberInitials(member)"
            icon="i-lucide-user-round"
            size="md"
          />
          <span class="truncate font-medium">{{ member.name }}</span>
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { WorkspaceTeamMember } from '../../../../composables/fireux/workspace/useTeam'

defineProps<{
  open: boolean
  label: string
  members: readonly WorkspaceTeamMember[]
  routeBase: string
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'select', id: string): void
}>()
function select(id: string) {
  emit('select', id)
  emit('update:open', false)
}
const memberInitials = (member: WorkspaceTeamMember) =>
  member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
</script>
