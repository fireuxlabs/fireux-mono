<template>
  <section id="project-team-members">
    <UCard v-if="pending || members.length" :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center gap-3">
          <h2 class="text-base font-semibold text-highlighted">People</h2>
          <span class="text-sm tabular-nums text-dimmed">
            {{ members.length }}
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

      <ul v-else class="divide-y divide-default">
        <li
          v-for="member in members"
          :key="member.id"
          class="flex items-center gap-3 px-4 py-3 sm:px-6"
        >
          <UAvatar
            :src="member.avatar || undefined"
            :alt="member.display_name"
            size="md"
            class="shrink-0"
          />
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-medium text-highlighted">
              {{ member.display_name || member.handle || member.id }}
            </h3>
            <p v-if="member.handle" class="mt-0.5 truncate text-xs text-dimmed">
              @{{ member.handle }}
            </p>
          </div>
          <UBadge color="neutral" variant="subtle">
            {{ member.access === 'operator' ? 'Operator' : 'Team' }}
          </UBadge>
        </li>
      </ul>
    </UCard>

    <UAlert
      v-if="!pending && error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Project Team could not be loaded"
      description="Please try again."
    />

    <UAlert
      v-else-if="!pending && !members.length"
      color="neutral"
      variant="subtle"
      icon="i-lucide-users"
      title="No team members yet"
      description="Add the first person to begin this Project Team."
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectTeamContext } from '../../../composables/workspace/team/useProjectTeamContext'

const { members, pending, error } = useProjectTeamContext()
</script>
