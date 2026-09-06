<template>
  <div
    v-if="pending || sortedMembers.length"
    tabindex="-1"
    class="outline-none"
  >
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-base font-semibold text-highlighted">People</h2>
          <span class="text-sm tabular-nums text-dimmed">
            {{ filtered.length }}
          </span>
          <USelect
            v-model="filter"
            :items="options"
            aria-label="Filter People by assigned role"
            :disabled="pending"
            class="w-full sm:ml-auto sm:w-64"
          />
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
          v-for="member in filtered"
          :id="`team-member-${member.id}`"
          :key="member.id"
          :class="{ 'bg-elevated': selectedId === member.id }"
          class="flex scroll-mt-6 items-center gap-3 px-4 py-3 transition-colors target:bg-primary/5 sm:px-6"
        >
          <button
            type="button"
            :aria-pressed="selectedId === member.id"
            :aria-label="`Select ${member.name}`"
            @click="emit('select', member.id)"
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
              <h3
                class="truncate text-left text-sm font-medium text-highlighted"
              >
                {{ member.name }}
              </h3>
              <div class="mt-1 flex flex-wrap gap-1">
                <UBadge
                  v-for="role in member.organisationRoles || []"
                  :key="role"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                  >{{ role }}</UBadge
                >
                <span
                  v-if="!member.organisationRoles?.length"
                  class="text-xs text-muted"
                  >No roles assigned</span
                >
              </div>
              <p
                v-if="member.userId"
                class="mt-0.5 flex items-center gap-1 text-xs text-success"
              >
                <UIcon name="i-lucide-circle-check" class="size-3.5" />
                Account linked
              </p>
            </div>
          </button>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeamPeopleFilter } from '../../../composables/fireux/workspace/useTeamPeopleFilter'
import type { WorkspaceTeamMember } from '../../../composables/fireux/useTeam'

const props = withDefaults(
  defineProps<{
    roleLabels?: Record<string, string[]>
    members?: readonly WorkspaceTeamMember[]
    selectedId?: string
    pending?: boolean
  }>(),
  {
    members: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  select: [id: string]
}>()

const memberInitials = (member: WorkspaceTeamMember) =>
  member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
const sortedMembers = computed(() =>
  props.members
    .map((member) => ({
      ...member,
      organisationRoles: props.roleLabels?.[member.id] || [],
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
)
const { filter, options, filtered } = useTeamPeopleFilter(sortedMembers)
</script>
