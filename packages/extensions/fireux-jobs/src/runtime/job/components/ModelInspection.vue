<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: cull the ad-hoc Job card fixture. -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: inspect the canonical unhydrated Job shape. -->
<template>
  <section class="space-y-10">
    <UCard>
      <FireDiagnosticsModel
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
            <FireDiagnosticsDriftToolbar
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
import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { computed } from 'vue'
import { useJobCollection } from '../composables/useJobCollection'
import { useJobDirectory } from '../composables/useJobDirectory'
import { Job as JobModelRuntime } from '../models/job.model.ts'

defineOptions({ name: 'JobModelInspection' })

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
  buildDriftPayload: buildJobsDriftPayload,
  buildCopyPayload: buildJobsCopyPayload,
} = useDiagnosticsDriftFilter({
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
