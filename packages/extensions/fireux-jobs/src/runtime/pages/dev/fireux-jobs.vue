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
                :copy-label="copying ? 'Copying…' : 'Copy drift · Jobs'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setJobsDriftKind"
                @update:selected-field="updateJobsSelectedField"
                @copy="copyJobsDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Jobs (JSON)'"
            :data="allJobsJsonPayload"
            :default-open="false"
          />
        </template>

        <JobCollectionManager :cards="jobCards" />
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
                :copy-label="copying ? 'Copying…' : 'Copy drift · Professionals'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setProfessionalsDriftKind"
                @update:selected-field="updateProfessionalsSelectedField"
                @copy="copyProfessionalsDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Professionals (JSON)'"
            :data="allProfessionalsJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsProfilesProfessionalCollectionManager :cards="professionalCards" />
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
                :copy-label="copying ? 'Copying…' : 'Copy drift · Agents'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setAgentsDriftKind"
                @update:selected-field="updateAgentsSelectedField"
                @copy="copyAgentsDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Agents (JSON)'"
            :data="allAgentsJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsProfilesAgentCollectionManager :cards="agentCards" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useJobCollection } from '../../composables/fireux/firestore/jobs/fetch/useJobCollection'
import { useJobInterface } from '../../composables/fireux/firestore/jobs/utils/view/useJobInterface'
import { useAgentCollection } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection'
import { useAgentsInterface } from '../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentsInterface'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { Job as JobModelRuntime } from '../../models/objects/job.model'
import { AgentCore as AgentCoreRuntime } from '../../models/profiles/Agent/Agent.model'
import type { ProfessionalCore } from '../../models/profiles/Professional/Professional.model'
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
})

const jobCards = computed(() =>
  filteredJobs.value
    .map((job) => makeJobCard(job))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const allJobsJsonPayload = computed(() => ({
  totalJobs: jobsCollection.value.length,
  jobs: jobsCollection.value,
}))

const filteredJobsDriftPayload = computed(() =>
  jobCards.value.map((card) => {
    const drift = jobsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      title: card.title,
      drift,
    }
  })
)

const { globalProfessionals, localProfessionals } = useProfessionalCollection()
const { card: makeProfessionalCard } = useProfessional()

const professionalsCollection = computed(() => [
  ...(localProfessionals?.value ?? []),
  ...(globalProfessionals.value ?? []),
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
})

const professionalCards = computed(() => {
  return filteredProfessionals.value
    .map((entry) => makeProfessionalCard(entry as ProfessionalCore, (entry as any)?.user ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
})

const allProfessionalsJsonPayload = computed(() => ({
  totalProfessionals: professionalsCollection.value.length,
  professionals: professionalsCollection.value,
}))

const filteredProfessionalsDriftPayload = computed(() =>
  professionalCards.value.map((card) => {
    const drift = professionalsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      drift,
    }
  })
)

const { globalAgents, localAgents } = useAgentCollection()
const { card: makeAgentCard } = useAgentsInterface()

const agentsCollection = computed(() => [
  ...(localAgents?.value ?? []),
  ...(globalAgents.value ?? []),
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
})

const agentCards = computed(() => {
  return filteredAgents.value
    .map((entry) => makeAgentCard(entry as any))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
})

const allAgentsJsonPayload = computed(() => ({
  totalAgents: agentsCollection.value.length,
  agents: agentsCollection.value,
}))

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

const { copyJSON, copying } = useDevClipboard()

const copyJobsDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/objects/job.model.ts',
      driftKind: jobsDriftKind.value,
      selectedField: jobsSelectedField.value || null,
      totalJobs: jobsCollection.value.length,
      jobs: filteredJobsDriftPayload.value,
    },
    { label: 'Dev · Jobs · Filtered drift' }
  )
}

const copyProfessionalsDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts',
      driftKind: professionalsDriftKind.value,
      selectedField: professionalsSelectedField.value || null,
      totalProfessionals: professionalsCollection.value.length,
      professionals: filteredProfessionalsDriftPayload.value,
    },
    { label: 'Dev · Professionals · Filtered drift' }
  )
}

const copyAgentsDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts',
      driftKind: agentsDriftKind.value,
      selectedField: agentsSelectedField.value || null,
      totalAgents: agentsCollection.value.length,
      agents: filteredAgentsDriftPayload.value,
    },
    { label: 'Dev · Agents · Filtered drift' }
  )
}

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
