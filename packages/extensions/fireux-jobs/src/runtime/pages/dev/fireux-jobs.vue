<template>
  <UPage>
    <UPageHeader
      title="Dev · Jobs"
      description="Model shapes for Jobs, Professionals, and Agents."
    />

    <UPageBody class="space-y-6">
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
                @update:selected-field="updateJobsSelectedField"
              />
            </div>
          </div>
        </template>

        <JobCollectionManager :collection="filteredJobs" />
        <DevJson
          :title="'Jobs (JSON · raw)'"
          context="collection manager · jobs · raw"
          :data="jobsCollection"
          :default-open="false"
        />
      </UCard>

      <UCard>
        <DevModel
          :title="'Professionals · Model'"
          :model="professionalModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Professionals collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse professionals resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="professionalsDriftKind"
                :selected-field="professionalsSelectedField"
                :filter-options="professionalsFilterOptions"
                :copy-label="'Copy drift · Professionals'"
                :copy-payload="professionalsDriftCopyPayload"
                @update:drift-kind="setProfessionalsDriftKind"
                @update:selected-field="updateProfessionalsSelectedField"
              />
            </div>
          </div>
        </template>

        <OrganismsProfilesProfessionalCollectionManager :collection="filteredProfessionals" />
        <DevJson
          :title="'Professionals (JSON · raw)'"
          context="collection manager · professionals · raw"
          :data="rawProfessionalsCollection"
          :default-open="false"
        />
      </UCard>

      <UCard>
        <DevModel
          :title="'Agents · Model'"
          :model="agentModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Agents collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse agents resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="agentsDriftKind"
                :selected-field="agentsSelectedField"
                :filter-options="agentsFilterOptions"
                :copy-label="'Copy drift · Agents'"
                :copy-payload="agentsDriftCopyPayload"
                @update:drift-kind="setAgentsDriftKind"
                @update:selected-field="updateAgentsSelectedField"
              />
            </div>
          </div>
        </template>

        <OrganismsProfilesAgentCollectionManager :collection="filteredAgents" />
        <DevJson
          :title="'Agents (JSON · raw)'"
          context="collection manager · agents · raw"
          :data="rawAgentsCollection"
          :default-open="false"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useJobCollection } from '../../composables/fireux/firestore/jobs/fetch/useJobCollection'
import { useJobInterface } from '../../composables/fireux/firestore/jobs/utils/view/useJobInterface'
import { useAgentCollection } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection'
import { useAgentFetch } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentFetch'
import { useAgentInterface } from '../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection'
import { useProfessionalFetch } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalFetch'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { Job as JobModelRuntime } from '../../models/objects/job.model'
import { AgentCore as AgentCoreRuntime } from '../../models/profiles/Agent/Agent.model'
import { ProfessionalCore as ProfessionalCoreRuntime } from '../../models/profiles/Professional/Professional.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const jobModelRuntime = JobModelRuntime
const professionalModelRuntime = ProfessionalCoreRuntime
const agentModelRuntime = AgentCoreRuntime

const { appJobs } = useJobCollection()
const { card: makeJobCard } = useJobInterface()

const jobsCollection = computed(() => appJobs.value ?? [])

const {
  driftKind: jobsDriftKind,
  setDriftKind: setJobsDriftKind,
  selectedField: jobsSelectedField,
  driftById: jobsDriftById,
  filterOptions: jobsFilterOptions,
  filteredCollection: filteredJobs,
} = useDevDriftFilter({
  collection: jobsCollection,
  runtimeModel: jobModelRuntime,
  prepareForDrift: (entry) => {
    const { kitchen, ...rest } = (entry as Record<string, unknown>) ?? {}
    return rest
  },
})

const jobCards = computed(() =>
  filteredJobs.value
    .map((job) => makeJobCard(job))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)


const filteredJobsDriftPayload = computed(() =>
  filteredJobs.value.map((job, index) => {
    const jobId = String((job as any)?.id ?? '').trim()
    const drift = jobId
      ? jobsDriftById.value.get(jobId) ?? { missing: [], extra: [] }
      : { missing: ['id'], extra: [] }
    return {
      id: jobId || `missing-id-${index + 1}`,
      title: (job as any)?.title ?? '',
      drift,
    }
  })
)

const jobsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/objects/job.model.ts',
  driftKind: jobsDriftKind.value,
  selectedField: jobsSelectedField.value || null,
  totalJobs: jobsCollection.value.length,
  jobs: filteredJobsDriftPayload.value,
}))

const { coreProfessionals, appProfessionals } = useProfessionalFetch()
const { coreProfessionals: rawCoreProfessionals, appProfessionals: rawAppProfessionals } = useProfessionalCollection()
const { card: makeProfessionalCard } = useProfessional()

const professionalsCollection = computed(() => [
  ...(appProfessionals?.value ?? []),
  ...(coreProfessionals.value ?? []),
])

const rawProfessionalsCollection = computed(() => [
  ...(rawAppProfessionals?.value ?? []),
  ...(rawCoreProfessionals.value ?? []),
])

const {
  driftKind: professionalsDriftKind,
  setDriftKind: setProfessionalsDriftKind,
  selectedField: professionalsSelectedField,
  driftById: professionalsDriftById,
  filterOptions: professionalsFilterOptions,
  filteredCollection: filteredProfessionals,
} = useDevDriftFilter({
  collection: professionalsCollection,
  runtimeModel: professionalModelRuntime,
  prepareForDrift: (entry) => {
    const { user, ...rest } = (entry as Record<string, unknown>) ?? {}
    return rest
  },
})

const hydratedProfessionalById = computed(() => {
  const map = new Map<string, any>()
  for (const entry of appProfessionals?.value ?? []) {
    if (entry?.id) map.set(String(entry.id), entry)
  }
  for (const entry of coreProfessionals.value ?? []) {
    if (entry?.id) map.set(String(entry.id), entry)
  }
  return map
})

const professionalCards = computed(() => {
  return filteredProfessionals.value
    .map((entry) => {
      const id = String((entry as any)?.id ?? '').trim()
      const hydrated = id ? hydratedProfessionalById.value.get(id) : null
      return makeProfessionalCard((hydrated ?? entry) as any)
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
})


const filteredProfessionalsDriftPayload = computed(() =>
  filteredProfessionals.value.map((entry, index) => {
    const id = String((entry as any)?.id ?? '').trim()
    const drift = id
      ? professionalsDriftById.value.get(id) ?? { missing: [], extra: [] }
      : { missing: ['id'], extra: [] }
    const userDisplayName = (entry as any)?.user?.display_name
    const userHandle = (entry as any)?.user?.handle
    return {
      id: id || `missing-id-${index + 1}`,
      displayName:
        userDisplayName ??
        userHandle ??
        (entry as any)?.display_name ??
        (entry as any)?.handle ??
        id ?? '',
      drift,
    }
  })
)

const professionalsMissingSummary = computed(() => {
  const counts = new Map<string, number>()
  for (const entry of filteredProfessionalsDriftPayload.value) {
    for (const field of entry.drift?.missing ?? []) {
      counts.set(field, (counts.get(field) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)
})

const professionalsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts',
  driftKind: professionalsDriftKind.value,
  selectedField: professionalsSelectedField.value || null,
  totalProfessionals: professionalsCollection.value.length,
  professionals: filteredProfessionalsDriftPayload.value,
  missingSummary: professionalsMissingSummary.value,
}))

const { coreAgents, appAgents } = useAgentFetch()
const { coreAgents: rawCoreAgents, appAgents: rawAppAgents } = useAgentCollection()
const { card: makeAgentCard } = useAgentInterface()

const agentsCollection = computed(() => [
  ...(rawAppAgents?.value ?? []),
  ...(rawCoreAgents.value ?? []),
])

const rawAgentsCollection = computed(() => [
  ...(rawAppAgents?.value ?? []),
  ...(rawCoreAgents.value ?? []),
])

const {
  driftKind: agentsDriftKind,
  setDriftKind: setAgentsDriftKind,
  selectedField: agentsSelectedField,
  driftById: agentsDriftById,
  filterOptions: agentsFilterOptions,
  filteredCollection: filteredAgents,
} = useDevDriftFilter({
  collection: agentsCollection,
  runtimeModel: agentModelRuntime,
  prepareForDrift: (entry) => {
    const { user, ...rest } = (entry as Record<string, unknown>) ?? {}
    return rest
  },
})

const hydratedAgentById = computed(() => {
  const map = new Map<string, any>()
  for (const entry of appAgents?.value ?? []) {
    if (entry?.id) map.set(String(entry.id), entry)
  }
  for (const entry of coreAgents.value ?? []) {
    if (entry?.id) map.set(String(entry.id), entry)
  }
  return map
})

const agentCards = computed(() => {
  return filteredAgents.value
    .map((entry) => {
      const id = String((entry as any)?.id ?? '').trim()
      const hydrated = id ? hydratedAgentById.value.get(id) : null
      return makeAgentCard((hydrated ?? entry) as any)
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
})


const filteredAgentsDriftPayload = computed(() =>
  agentCards.value.map((card) => {
    const drift = agentsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      drift,
    }
  })
)

const agentsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts',
  driftKind: agentsDriftKind.value,
  selectedField: agentsSelectedField.value || null,
  totalAgents: agentsCollection.value.length,
  agents: filteredAgentsDriftPayload.value,
}))

const updateJobsSelectedField = (value: string) => {
  jobsSelectedField.value = value
}

const updateProfessionalsSelectedField = (value: string) => {
  professionalsSelectedField.value = value
}

const updateAgentsSelectedField = (value: string) => {
  agentsSelectedField.value = value
}
</script>
