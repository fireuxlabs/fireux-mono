<template>
  <UModal
    :open="open"
    title="Read Project Team"
    description="Choose a team member to open their detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="grid gap-2">
        <UButton
          v-for="member in state.team.members"
          :key="member.id"
          :to="`/workspace/project/team/${encodeURIComponent(member.id)}`"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="emit('update:open', false)"
        >
          <UAvatar
            :src="member.avatar || undefined"
            :alt="member.name"
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
import type { useProjectWorkspaceTeam } from '../../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>
defineProps<{ open: boolean; state: Workspace['state']['value'] }>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
</script>
