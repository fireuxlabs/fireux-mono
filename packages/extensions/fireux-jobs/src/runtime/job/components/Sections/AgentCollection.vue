<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-highlighted">
            Your job postings
          </h2>
          <p class="mt-1 text-sm text-muted">
            Return to any private draft or live posting owned by your account.
          </p>
        </div>
        <UButton to="/jobs/create" color="primary" icon="i-lucide-plus">
          New draft
        </UButton>
      </div>
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
      description="Your job postings could not be loaded. Please try again."
    />

    <template v-else>
      <div v-if="jobs.length" class="space-y-5">
        <div class="grid gap-3 sm:grid-cols-3">
          <UPageCard
            title="Total"
            :description="String(total)"
            icon="i-lucide-briefcase-business"
            variant="subtle"
          />
          <UPageCard
            title="Private drafts"
            :description="String(draftCount)"
            icon="i-lucide-file-pen-line"
            variant="subtle"
          />
          <UPageCard
            title="Live jobs"
            :description="String(liveCount)"
            icon="i-lucide-radio-tower"
            variant="subtle"
          />
        </div>

        <ul class="grid gap-4 lg:grid-cols-2">
          <li v-for="job in jobs" :key="job.id">
            <UCard class="h-full">
              <div class="flex h-full flex-col gap-5">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge
                        size="xs"
                        :color="publicationColor(job)"
                        variant="soft"
                      >
                        {{ publicationLabel(job) }}
                      </UBadge>
                      <UBadge size="xs" color="neutral" variant="soft">
                        {{ job.category_id }}
                      </UBadge>
                    </div>
                    <h3
                      class="text-base font-semibold leading-tight text-highlighted"
                    >
                      {{ job.title || 'Untitled job' }}
                    </h3>
                  </div>
                  <UIcon
                    name="i-lucide-briefcase-business"
                    class="size-5 shrink-0 text-muted"
                  />
                </div>

                <p class="line-clamp-3 text-sm leading-6 text-muted">
                  {{ job.description || 'No job description yet.' }}
                </p>

                <div
                  class="mt-auto flex flex-wrap gap-2 border-t border-default pt-4"
                >
                  <UButton
                    :to="`/jobs/edit/${encodeURIComponent(job.id)}`"
                    color="primary"
                    variant="soft"
                    icon="i-lucide-pencil-line"
                  >
                    Review and edit
                  </UButton>
                  <UButton
                    v-if="isLive(job)"
                    :to="`/jobs/${encodeURIComponent(job.id)}`"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-external-link"
                  >
                    Open job
                  </UButton>
                </div>
              </div>
            </UCard>
          </li>
        </ul>
      </div>

      <UPageCard
        v-else
        title="Create your first job"
        description="Start with a private draft. Nothing appears publicly until you review and publish it."
        icon="i-lucide-file-plus-2"
        variant="subtle"
      >
        <UButton to="/jobs/create" color="primary" icon="i-lucide-plus">
          Start a job draft
        </UButton>
      </UPageCard>
    </template>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: keep owner postings linked to authenticated authoring.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: consume the server-bounded current-author collection directly.
import { computed } from 'vue'
import { useJobCollection } from '../../composables/firestore/fetch/useJobCollection.ts'
import type { Job } from '../../models/job.model.ts'

const { jobs, outcome: sourceOutcome } = useJobCollection()

const outcome = computed(() => sourceOutcome.value)
const total = computed(() => jobs.value.length)
const isLive = (job: Job) =>
  job.visibility === 'public' && job.status === 'open'
const draftCount = computed(
  () => jobs.value.filter((job: Job) => job.visibility !== 'public').length
)
const liveCount = computed(() => jobs.value.filter(isLive).length)
const publicationLabel = (job: Job) => {
  if (isLive(job)) return 'Live'
  if (job.status === 'closed') return 'Closed'
  return 'Private draft'
}
const publicationColor = (job: Job) => {
  if (isLive(job)) return 'success'
  if (job.status === 'closed') return 'neutral'
  return 'warning'
}
</script>
