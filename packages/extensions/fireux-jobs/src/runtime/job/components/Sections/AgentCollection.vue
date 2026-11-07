<template>
  <UCard>
    <template #header>
      <div class="card__header">
        <div>
          <h2 class="fx-type-card-heading">Your job postings</h2>
          <p>
            Return to any private draft or live posting owned by your account.
          </p>
        </div>
        <UButton to="/jobs/create" color="primary" icon="i-lucide-plus">
          New draft
        </UButton>
      </div>
    </template>

    <FireState v-if="outcome === 'pending'" outcome="pending" />

    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="soft"
      title="Jobs unavailable"
      description="Your job postings could not be loaded. Please try again."
    />

    <template v-else>
      <div v-if="jobs.length" class="fx-card-body-stack">
        <UPageGrid>
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
        </UPageGrid>

        <UPageGrid as="ul">
          <li v-for="job in jobs" :key="job.id">
            <UCard>
              <div>
                <div class="card__header">
                  <div class="fx-card-body-stack">
                    <div class="card__badges">
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
                    <h3 class="fx-type-card-heading">
                      {{ job.title || 'Untitled job' }}
                    </h3>
                  </div>
                  <UIcon name="i-lucide-briefcase-business" />
                </div>

                <p>
                  {{ job.description || 'No job description yet.' }}
                </p>

                <div>
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
        </UPageGrid>
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
// Concurrent edit — 2026-07-21 12:53 CEST — Job authoring: keep owner postings linked to authenticated tools.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: consume the server-bounded current-author collection directly.
import { computed } from 'vue'
import { useJobCollection } from '../../composables/useJobCollection.ts'
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
