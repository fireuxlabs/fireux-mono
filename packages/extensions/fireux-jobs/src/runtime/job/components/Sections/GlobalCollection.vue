<template>
  <UCard>
    <template #header>
      <div class="card__header">
        <h2 class="fx-type-card-heading">Network jobs</h2>
        <UBadge v-if="isSettled" variant="soft">{{ total }}</UBadge>
      </div>
      <p>Open roles published across this runtime.</p>
    </template>

    <FireState v-if="outcome === 'pending'" outcome="pending" />

    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="soft"
      title="Jobs unavailable"
      description="Network jobs could not be loaded. Please try again."
    />

    <template v-else>
      <UPageGrid v-if="jobs.length" as="ul">
        <li v-for="job in jobs" :key="job.id">
          <UCard>
            <div class="card__header">
              <div class="fx-card-body-stack">
                <h3 class="fx-type-card-heading">{{ job.title }}</h3>
                <p>
                  {{ job.category_id }}
                </p>
              </div>
              <div>
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
      </UPageGrid>

      <p v-else>No jobs published yet. Check back soon.</p>
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
