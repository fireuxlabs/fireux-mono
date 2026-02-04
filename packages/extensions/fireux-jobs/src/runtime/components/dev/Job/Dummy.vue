<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/dev/Job/Dummy.vue -->

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
        <button
          v-for="(surface, index) in jobSurfaces"
          :key="surface.job.id"
          type="button"
          class="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary"
          @click="selectedIndex = index"
        >
          <JobCardsPill v-bind="surface.pill" />
        </button>
      </div>

      <JobCardsPreview
        :image-url="current.preview.imageUrl"
        :title="current.preview.title"
        :subtitle="current.preview.subtitle"
        :badges="current.preview.badges"
        :prop="current.preview.prop"
      />

      <JobCardsCell v-bind="current.cell" />

      <JobCardsProfile :card="current.profile" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevJobDummy' })

import { computed, ref } from 'vue'
import { dummyJobSurfaceList } from '../../../../../../../../dummy/job.dummy'

const jobSurfaces = dummyJobSurfaceList
const selectedIndex = ref(0)

const current = computed(() => jobSurfaces[selectedIndex.value] ?? jobSurfaces[0])
</script>