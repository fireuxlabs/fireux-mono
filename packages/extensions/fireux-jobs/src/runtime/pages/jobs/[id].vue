<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: render generic workplace metadata without domain hydration. -->
<!-- Concurrent edit — 2026-07-21 12:53 CEST — Job detail: render the exact SSR read without management controls. -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: render projected Company, Place, schedule, and employment truth. -->
<template>
  <UPage>
    <UPageHeader :title="jobTitle" :description="jobSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          to="/jobs"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-14 rounded-xl" />
        <USkeleton class="h-48 rounded-xl" />
      </div>

      <UAlert
        v-else-if="failed"
        title="Job unavailable"
        description="The job could not be loaded. Please try again."
        color="error"
        variant="soft"
      />

      <UAlert
        v-else-if="missing"
        title="Job not found"
        description="This job is not currently open."
        color="error"
        variant="soft"
      />

      <template v-else-if="job">
        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Job Detail"
          context="Job detail page · jobs/[id] · endpoint-first SSR"
          :objects="devPayload"
          :derived="{}"
          :default-open="false"
        />

        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div class="space-y-6">
            <JobCardsProfile :card="jobCard" :job="jobView" />
          </div>

          <div class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="font-semibold">Category</h3>
              </template>
              <p class="text-sm font-medium text-highlighted">
                {{ job.category_id }}
              </p>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Employer</h3>
              </template>
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="companyPlace?.image_url || undefined"
                  :alt="companyPlace?.short_name || companyPlace?.name"
                  icon="i-lucide-building-2"
                />
                <p class="text-sm font-medium text-highlighted">
                  {{ companyPlace?.short_name || companyPlace?.name }}
                </p>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-semibold">Location</h3>
              </template>
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="place?.image_url || undefined"
                  :alt="place?.short_name || place?.name"
                  icon="i-lucide-map-pin"
                />
                <div>
                  <p class="text-sm font-medium text-highlighted">
                    {{ place?.short_name || place?.name }}
                  </p>
                  <p v-if="place?.short_address" class="text-xs text-muted">
                    {{ place.short_address }}
                  </p>
                </div>
              </div>
            </UCard>

            <JobApplyPanel
              :job-id="job.id"
              :application-doorway="applicationDoorway || undefined"
            />
          </div>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { setResponseStatus } from '#imports'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import JobCardsProfile from '../../job/components/Cards/Profile.vue'
import JobApplyPanel from '../../job/components/Apply/Panel.vue'
import { useJobDetail } from '../../job/composables/useJobDetail'
import { useJobSeo } from '../../job/composables/useJobSeo'
import { useJobInterface } from '../../job/composables/firestore/utils/view/useJobInterface'

const route = useRoute()
const jobId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? (raw[0]?.toString() ?? null)
    : (raw?.toString() ?? null)
})

const fetched = useJobDetail(jobId)
await fetched.ready
const {
  job,
  company,
  companyPlace,
  place,
  applicationDoorway,
  pending,
  statusCode,
  missing,
  failed,
  outcome,
} = fetched
const { profile: jobCardFactory } = useJobInterface()

const jobView = computed(() =>
  job.value
    ? {
        ...job.value,
        company: companyPlace.value ?? undefined,
        place: place.value ?? undefined,
      }
    : null
)
const jobCard = computed(() =>
  jobView.value ? jobCardFactory(jobView.value) : null
)
const jobTitle = computed(() => job.value?.title || 'Job Details')
const jobSubtitle = computed(
  () => jobCard.value?.subtitle || job.value?.category_id || 'Open job posting'
)

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

definePageMeta({
  layout: 'default',
})

useJobSeo(jobView)

const devPayload = computed(() => ({
  job: job.value,
  company: company.value,
  companyPlace: companyPlace.value,
  place: place.value,
  applicationDoorway: applicationDoorway.value,
  page: { outcome: outcome.value },
}))
</script>
