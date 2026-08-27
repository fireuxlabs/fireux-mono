<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>Network jobs</h2>
        <UBadge v-if="isSettled" variant="soft">{{ total }}</UBadge>
      </div>
      <p class="text-sm opacity-70">
        Open roles published across this runtime.
      </p>
    </template>

    <div v-if="outcome === 'pending'" class="space-y-3">
      <USkeleton class="h-20 rounded-xl" />
      <USkeleton class="h-20 rounded-xl" />
    </div>

    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="soft"
      title="Jobs unavailable"
      description="Network jobs could not be loaded. Please try again."
    />

    <template v-else>
      <ul v-if="jobs.length" class="grid gap-4 md:grid-cols-2">
        <li v-for="job in jobs" :key="job.id">
          <UCard>
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <h3 class="font-semibold leading-tight">{{ job.title }}</h3>
                <p class="text-xs uppercase tracking-wide text-dimmed">
                  {{ job.category_id }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <UBadge
                  size="xs"
                  :color="badgeColor(job.status)"
                  variant="soft"
                >
                  {{ job.status || 'open' }}
                </UBadge>
                <UButton
                  variant="ghost"
                  icon="i-lucide-arrow-right"
                  :to="`/jobs/${job.id}`"
                />
              </div>
            </div>
          </UCard>
        </li>
      </ul>

      <p v-else class="text-sm opacity-70">
        No jobs published yet. Check back soon.
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 13:09 CEST — Job Directory: render category while source App scope stays server-owned.
import { computed } from 'vue'
import { useJobDirectory } from '../../composables/useJobDirectory.ts'
import type { JobDirectoryEntry } from '../../models/job-collection.model.ts'

const { jobs: directoryJobs, outcome: sourceOutcome } = useJobDirectory()

const jobs = computed<JobDirectoryEntry[]>(() => directoryJobs.value ?? [])
const outcome = computed(() => sourceOutcome.value)
const isSettled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
const total = computed(() => jobs.value.length)

const badgeColor = (status?: JobDirectoryEntry['status']) => {
  if (status === 'open') return 'success'
  return 'neutral'
}
</script>
