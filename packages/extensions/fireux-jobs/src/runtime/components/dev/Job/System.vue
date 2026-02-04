<template>
  <section class="space-y-10">
    <DevJobDummy />

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
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Jobs collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse jobs resolved for this runtime and filter by model drift.
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

      <JobCollectionManager :collection="filteredJobs" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useJobCollection } from '../../../composables/fireux/firestore/jobs/fetch/useJobCollection'
import { Job as JobModelRuntime } from '../../../models/objects/job.model'

defineOptions({ name: 'DevJobSystem' })

const jobModelRuntime = JobModelRuntime

const { appJobs } = useJobCollection()
const jobsCollection = computed(() => appJobs.value ?? [])

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
  prepareForDrift: (entry) => {
    const { kitchen, ...rest } = (entry as unknown as Record<string, unknown>) ?? {}
    return rest
  },
})

const filteredJobsDriftPayload = buildJobsDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    title: (doc as any)?.title ?? '',
    drift,
  }),
})

const jobsDriftCopyPayload = buildJobsCopyPayload({
  modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/objects/job.model.ts',
  itemsKey: 'jobs',
  items: filteredJobsDriftPayload,
  total: computed(() => jobsCollection.value.length),
})
</script>
