<template>
  <UModal
    :open="open"
    :title="`Read ${label}`"
    description="Choose a team member to open their detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="grid gap-2">
        <UButton
          v-for="member in members"
          :key="member.id"
          :to="`${routeBase}/${encodeURIComponent(member.id)}`"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="emit('update:open', false)"
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
import type { WorkspaceTeamMember } from '../../../../composables/fireux/workspace/useWorkspaceTeam'

defineProps<{
  open: boolean
  label: string
  members: WorkspaceTeamMember[]
  routeBase: string
}>()

const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
const memberInitials = (member: WorkspaceTeamMember) =>
  member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
</script>
