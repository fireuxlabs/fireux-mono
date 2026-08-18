<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Project team</h2>
          <p class="mt-1 text-sm text-dimmed">
            People with access to {{ projectName }} in the FireUX Console.
          </p>
        </div>
        <UBadge color="neutral" variant="soft">{{ count }}</UBadge>
      </div>
    </template>

    <div v-if="pending" class="text-sm text-dimmed">Loading team…</div>
    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Project team could not be loaded"
      description="Please try again."
    />
    <div v-else-if="members.length" class="divide-y divide-default">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
      >
        <UAvatar :src="member.avatar" :alt="member.display_name" size="md" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ member.display_name || member.handle || member.id }}
          </p>
          <p v-if="member.handle" class="truncate text-xs text-dimmed">
            @{{ member.handle }}
          </p>
        </div>
        <UBadge color="neutral" variant="subtle">
          {{ member.access === 'operator' ? 'Operator' : 'Team' }}
        </UBadge>
      </div>
    </div>
    <p v-else class="text-sm text-dimmed">No Project team members found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsoleTeam } from '../../../composables/console/team/useProjectConsoleTeam'

const { selectedProject, members, count, pending, error } =
  useProjectConsoleTeam()
const projectName = computed(
  () =>
    selectedProject.value?.name || selectedProject.value?.id || 'this Project'
)
</script>
