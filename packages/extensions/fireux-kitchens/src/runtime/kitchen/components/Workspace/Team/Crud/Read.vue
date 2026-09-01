<template>
  <UModal
    :open="open"
    title="Read Kitchen Team"
    description="Choose a team member to open their detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="grid gap-2">
        <UButton
          v-for="member in state.team.members"
          :key="member.id"
          :to="`/workspace/kitchen/team/${encodeURIComponent(member.id)}`"
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
          <span class="truncate font-medium">
            {{ member.name }}
          </span>
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { useKitchenWorkspaceTeam } from '../../../../composables/workspace/team/useKitchenWorkspaceTeam'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>
defineProps<{ open: boolean; state: Workspace['state']['value'] }>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
const memberInitials = (member: WorkspaceTeamMember) =>
  member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
</script>
