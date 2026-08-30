<template>
  <article class="space-y-6">
    <UPageHeader :title="job.title" :description="jobCard?.subtitle">
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

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <JobCardsProfile v-if="jobCard" :card="jobCard" :job="jobView" />

      <div class="space-y-6">
        <UCard>
          <template #header><h3 class="font-semibold">Category</h3></template>
          <p class="text-sm font-medium text-highlighted">
            {{ job.category_id }}
          </p>
        </UCard>

        <UCard v-if="companyPlace">
          <template #header><h3 class="font-semibold">Employer</h3></template>
          <p class="text-sm font-medium text-highlighted">
            {{ companyPlace.short_name || companyPlace.name }}
          </p>
        </UCard>

        <UCard v-if="place">
          <template #header><h3 class="font-semibold">Location</h3></template>
          <p class="text-sm font-medium text-highlighted">
            {{ place.short_name || place.name }}
          </p>
          <p v-if="place.short_address" class="text-xs text-muted">
            {{ place.short_address }}
          </p>
        </UCard>

        <JobApplyPanel
          :job-id="job.id"
          :application-doorway="applicationDoorway || undefined"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Job } from '../models/job.model'
import { useJobDetail } from '../composables/useJobDetail'
import { useJobSeo } from '../composables/useJobSeo'
import { useJobInterface } from '../composables/firestore/utils/view/useJobInterface'

const props = defineProps<{ job: Job }>()
const { companyPlace, place, applicationDoorway } = useJobDetail(
  computed(() => props.job.id)
)
const { profile } = useJobInterface()
const jobView = computed(() => ({
  ...props.job,
  company: companyPlace.value ?? undefined,
  place: place.value ?? undefined,
}))
const jobCard = computed(() => profile(jobView.value))

useJobSeo(jobView)
</script>
