<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/dev/Job/Demo.vue -->

<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Job card surfaces</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pill, preview, cell, and profile variants with a real-looking payload.</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <JobCardsPill
          v-for="(surface, index) in jobSurfaces"
          :key="surface.job.id"
          v-bind="surface.pill"
          action
          @action="selectedIndex = index"
        />
      </div>

      <JobCardsPreview
        v-if="current?.preview"
        :image-url="current.preview.imageUrl"
        :title="current.preview.title"
        :subtitle="current.preview.subtitle"
        :badges="current.preview.badges"
        :prop="current.preview.description"
      />

      <JobCardsCell v-if="current?.cell" v-bind="current.cell" />

      <JobCardsProfile v-if="current?.profile" :card="current.profile" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevJobDemo' })

import { computed, ref } from 'vue'
import {
  JobModel,
  type Job,
} from '../../../models/job.model'
import {
  useJobInterface,
  type JobCard,
  type JobView,
} from '../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

const demoJobs: JobView[] = [
  {
    ...JobModel,
    id: 'job-demo-chef',
    title: 'Chef / Cook',
    description: 'Short deployment covering evening service.',
    status: 'open',
    workplace_type: 'kitchen',
    workplace_id: 'demo-kitchen',
    workplace_label: 'Demo Kitchen',
    company_id: 'demo-company',
    pay_rate: 32,
    pay_unit: 'hour',
    workplace: {
      short_address: 'Interlaken, Switzerland',
      image_url: '',
    },
  } as Job,
  {
    ...JobModel,
    id: 'job-demo-breakfast',
    title: 'Breakfast Lead',
    description: 'Early shift, fast turnaround, consistent breakfast execution.',
    status: 'open',
    workplace_type: 'kitchen',
    workplace_id: 'demo-kitchen-breakfast',
    workplace_label: 'Breakfast Kitchen',
    company_id: 'demo-company',
    pay_rate: 28,
    pay_unit: 'hour',
    workplace: {
      short_address: 'Matten bei Interlaken, Switzerland',
      image_url: '',
    },
  } as Job,
]
const {
  pill,
  preview,
  cell,
  profile,
} = useJobInterface()
const isJobCard = (card: JobCard.Card | null): card is JobCard.Card =>
  Boolean(card)
const jobSurfaces = computed(() =>
  demoJobs
    .map((job) => {
      const pillCard = pill(job)
      const previewCard = preview(job)
      const cellCard = cell(job)
      const profileCard = profile(job)
      if (
        !isJobCard(pillCard) ||
        !isJobCard(previewCard) ||
        !isJobCard(cellCard) ||
        !isJobCard(profileCard)
      ) {
        return null
      }

      return {
        job,
        pill: pillCard,
        preview: previewCard,
        cell: cellCard,
        profile: profileCard,
      }
    })
    .filter((surface): surface is NonNullable<typeof surface> => Boolean(surface))
)
const selectedIndex = ref(0)

const current = computed(() =>
  jobSurfaces.value[selectedIndex.value] ?? jobSurfaces.value[0]
)
</script>
