<template>
  <div
    v-if="pending || sortedMembers.length"
    tabindex="-1"
    class="outline-none"
  >
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center gap-3">
          <h2 class="text-base font-semibold text-highlighted">People</h2>
          <span class="text-sm tabular-nums text-dimmed">
            {{ sortedMembers.length }}
          </span>
        </div>
      </template>

      <div v-if="pending" class="divide-y divide-default px-4 sm:px-6">
        <div
          v-for="index in 3"
          :key="index"
          class="flex items-center gap-3 py-4"
        >
          <USkeleton class="size-10 shrink-0 rounded-full" />
          <USkeleton class="h-4 w-32" />
        </div>
      </div>

      <ul v-else-if="sortedMembers.length" class="divide-y divide-default">
        <li
          v-for="member in sortedMembers"
          :id="`team-member-${member.id}`"
          :key="member.id"
          class="flex scroll-mt-6 items-center gap-3 px-4 py-3 transition-colors target:bg-primary/5 sm:px-6"
        >
          <NuxtLink
            :to="memberPath(member)"
            class="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <UAvatar
              :src="member.avatar || undefined"
              :alt="member.name"
              :text="memberInitials(member)"
              size="md"
              class="shrink-0"
            />

            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-medium text-highlighted">
                {{ member.name }}
              </h3>
              <p
                v-if="member.userId"
                class="mt-0.5 flex items-center gap-1 text-xs text-success"
              >
                <UIcon name="i-lucide-circle-check" class="size-3.5" />
                Account linked
              </p>
            </div>
          </NuxtLink>

          <div class="flex shrink-0 items-center gap-1">
            <UButton
              v-if="!member.userId"
              label="Invite"
              icon="i-lucide-link"
              color="neutral"
              variant="ghost"
              size="sm"
              :loading="invitingMemberId === member.id"
              :disabled="Boolean(invitingMemberId)"
              @click="emit('invite', member)"
            />
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'

const props = withDefaults(
  defineProps<{
    members?: WorkspaceTeamMember[]
    pending?: boolean
    invitingMemberId?: string
  }>(),
  {
    members: () => [],
    pending: false,
    invitingMemberId: '',
  }
)

const emit = defineEmits<{
  invite: [member: WorkspaceTeamMember]
}>()

const memberInitials = (member: WorkspaceTeamMember) =>
  member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
const memberPath = (member: WorkspaceTeamMember) =>
  `/workspace/kitchen/team/${encodeURIComponent(member.id)}`
const sortedMembers = computed(() =>
  props.members
    .filter((member) => member.status === 'active')
    .sort((left, right) => left.name.localeCompare(right.name))
)
</script>
