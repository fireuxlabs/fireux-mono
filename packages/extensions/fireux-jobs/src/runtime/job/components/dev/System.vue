<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: cull the ad-hoc Job card fixture. -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: inspect the canonical unhydrated Job shape. -->
<template>
  <section class="space-y-10">
    <UCard>
      <DevModel
        :title="'Jobs · Model'"
        :model="jobModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Jobs collection
            </p>
            <p class="text-xs text-muted">
              Inspect model drift separately from the public jobs collection manager.
            </p>
            <DevDriftToolbar
              :drift-kind="jobsDriftKind"
              :selected-field="jobsSelectedField"
              :filter-options="jobsFilterOptions"
              :copy-label="'Copy drift · Jobs'"
              :copy-payload="jobsDriftCopyPayload"
              @update:drift-kind="setJobsDriftKind"
              @update:selected-field="setJobsSelectedField"
            />
          </div>
        </div>
      </template>

      <JobCollection :jobs="directoryJobs" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useJobCollection } from '../../composables/useJobCollection'
import { useJobDirectory } from '../../composables/useJobDirectory'
import { Job as JobModelRuntime } from '../../models/job.model.ts'

defineOptions({ name: 'DevJobSystem' })

const jobModelRuntime = JobModelRuntime

const { jobs } = useJobCollection()
const { jobs: directoryJobs } = useJobDirectory()
const jobsCollection = computed(() => jobs.value ?? [])

const {
  driftKind: jobsDriftKind,
  setDriftKind: setJobsDriftKind,
  selectedField: jobsSelectedField,
  setSelectedField: setJobsSelectedField,
  filterOptions: jobsFilterOptions,
  filteredCollection: filteredJobs,
  buildDriftPayload: buildJobsDriftPayload,
  buildCopyPayload: buildJobsCopyPayload,
} = useDevDriftFilter({
  collection: jobsCollection,
  runtimeModel: jobModelRuntime,
  prepareForDrift: (entry) =>
    (entry as unknown as Record<string, unknown>) ?? {},
})

const filteredJobsDriftPayload = buildJobsDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    title: (doc as any)?.title ?? '',
    drift,
  }),
})

const jobsDriftCopyPayload = buildJobsCopyPayload({
  modelPath: 'packages/extensions/fireux-jobs/src/runtime/job/models/job.model.ts',
  itemsKey: 'jobs',
  items: filteredJobsDriftPayload,
  total: computed(() => jobsCollection.value.length),
})
</script>
