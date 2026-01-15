<template>
  <UPage>
    <UPageHeader
      title="Dev · Jobs"
      description="Collection-first view; filter by missing or extra fields (against runtime models)."
    />

    <UPageBody class="space-y-10">
      <DevPane
        title="Jobs collection"
        description="Browse jobs resolved for this runtime and filter by model drift."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="jobDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setJobDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="jobDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setJobDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ jobDriftKind }}:</span>

          <UButton
            v-for="option in jobFilterOptions"
            :key="option.value"
            size="xs"
            :variant="jobSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="jobSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyFilteredJobs"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <UAlert
          v-if="!jobFilteredCards.length"
          color="neutral"
          variant="soft"
          icon="i-lucide-inbox"
          title="No matching jobs"
          description="Adjust filters or add job documents to Firestore."
        />

        <div v-else class="grid gap-3 md:grid-cols-2">
          <OrganismsObjectsJobCardsCell
            v-for="card in jobFilteredCards"
            :key="card.id"
            :to="card.to"
            :title="card.title"
            :description="card.description"
            :badges="card.badges"
            :avatar-url="card.avatarUrl"
            :subtitle="card.subtitle"
            :prop="jobTaglineById.get(card.id) || ''"
          />
        </div>
      </DevPane>

      <DevPane
        title="Jobs (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Jobs (Ext) · Jobs · All data"
        :debug-data="jobAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        title="Professionals collection (global)"
        description="Browse global professionals and filter by model drift (ProfessionalCore)."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="professionalGlobalDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setProfessionalGlobalDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="professionalGlobalDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setProfessionalGlobalDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ professionalGlobalDriftKind }}:</span>

          <UButton
            v-for="option in professionalGlobalFilterOptions"
            :key="option.value"
            size="xs"
            :variant="professionalGlobalSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="professionalGlobalSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyProfessionalGlobalFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!professionalGlobalFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching professionals"
            description="Adjust filters or add professional documents to Firestore."
          />

          <OrganismsProfilesProfessionalCollectionList
            v-else
            :cards="professionalGlobalFilteredCards"
            variant="pill"
          />
        </div>
      </DevPane>

      <DevPane
        title="Professionals (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Jobs (Ext) · Professionals · Global · All data"
        :debug-data="professionalGlobalAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        v-if="isTenant && hasProfessionalLocalCollection"
        title="Professionals collection (tenant)"
        description="Browse tenant professionals and filter by model drift (ProfessionalCore)."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="professionalLocalDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setProfessionalLocalDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="professionalLocalDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setProfessionalLocalDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ professionalLocalDriftKind }}:</span>

          <UButton
            v-for="option in professionalLocalFilterOptions"
            :key="option.value"
            size="xs"
            :variant="professionalLocalSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="professionalLocalSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyProfessionalLocalFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!professionalLocalFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching professionals"
            description="Adjust filters or add professional documents to Firestore."
          />

          <OrganismsProfilesProfessionalCollectionList
            v-else
            :cards="professionalLocalFilteredCards"
            variant="pill"
          />
        </div>
      </DevPane>

      <DevPane
        v-if="isTenant && hasProfessionalLocalCollection"
        title="Professionals (JSON) · Tenant"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Jobs (Ext) · Professionals · Tenant · All data"
        :debug-data="professionalLocalAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        title="Agents collection (global)"
        description="Browse global agents and filter by model drift (AgentCore)."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="agentGlobalDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setAgentGlobalDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="agentGlobalDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setAgentGlobalDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ agentGlobalDriftKind }}:</span>

          <UButton
            v-for="option in agentGlobalFilterOptions"
            :key="option.value"
            size="xs"
            :variant="agentGlobalSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="agentGlobalSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyAgentGlobalFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!agentGlobalFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching agents"
            description="Adjust filters or add agent documents to Firestore."
          />

          <OrganismsProfilesAgentCollectionList
            v-else
            :cards="agentGlobalFilteredCards"
            variant="pill"
          />
        </div>
      </DevPane>

      <DevPane
        title="Agents (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Jobs (Ext) · Agents · Global · All data"
        :debug-data="agentGlobalAllJsonPayload"
        :default-open="false"
      />

      <DevPane
        v-if="isTenant && hasAgentLocalCollection"
        title="Agents collection (tenant)"
        description="Browse tenant agents and filter by model drift (AgentCore)."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="agentLocalDriftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setAgentLocalDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="agentLocalDriftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setAgentLocalDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">Filter {{ agentLocalDriftKind }}:</span>

          <UButton
            v-for="option in agentLocalFilterOptions"
            :key="option.value"
            size="xs"
            :variant="agentLocalSelectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="agentLocalSelectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyAgentLocalFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <div class="space-y-2">
          <UAlert
            v-if="!agentLocalFilteredCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching agents"
            description="Adjust filters or add agent documents to Firestore."
          />

          <OrganismsProfilesAgentCollectionList
            v-else
            :cards="agentLocalFilteredCards"
            variant="pill"
          />
        </div>
      </DevPane>

      <DevPane
        v-if="isTenant && hasAgentLocalCollection"
        title="Agents (JSON) · Tenant"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Jobs (Ext) · Agents · Tenant · All data"
        :debug-data="agentLocalAllJsonPayload"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useJobCollection } from '../../composables/fireux/firestore/jobs/fetch/useJobCollection'
import { useJobInterface } from '../../composables/fireux/firestore/jobs/utils/view/useJobInterface'
import { useAgentCollection } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection'
import { useAgentsInterface, type AgentDirectoryEntry } from '../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentsInterface'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import type { Job as JobModel } from '../../models/objects/job.model'
import { Job as JobModelRuntime } from '../../models/objects/job.model'
import type { AgentCore } from '../../models/profiles/Agent/Agent.model'
import { AgentCore as AgentCoreRuntime } from '../../models/profiles/Agent/Agent.model'
import type { ProfessionalCore } from '../../models/profiles/Professional/Professional.model'
import { ProfessionalCore as ProfessionalCoreRuntime } from '../../models/profiles/Professional/Professional.model'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-jobs'],
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const { isTenant } = useFireUXConfig()
const { copyJSON, copying } = useDevClipboard()

function safeArray<T>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : []
}

// Jobs
const { appJobs } = useJobCollection()
const jobs = computed<JobModel[]>(() => appJobs.value ?? [])
const { card: makeJobCard } = useJobInterface()

const {
  driftKind: jobDriftKind,
  setDriftKind: setJobDriftKind,
  selectedField: jobSelectedField,
  driftById: jobDriftById,
  filterOptions: jobFilterOptions,
  filteredCollection: jobFilteredCollection,
} = useDevDriftFilter({
  collection: jobs,
  runtimeModel: JobModelRuntime as unknown as Record<string, unknown>,
})

const jobFilteredCards = computed(() =>
  jobFilteredCollection.value
    .map((job) => makeJobCard(job))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const jobTaglineById = computed(() => {
  const map = new Map<string, string>()
  for (const card of jobFilteredCards.value) {
    const drift = jobDriftById.value.get(card.id)
    if (!drift) continue
    const list = jobDriftKind.value === 'missing' ? drift.missing : drift.extra
    const selected = jobSelectedField.value

    if (selected && list.includes(selected)) {
      map.set(
        card.id,
        `${jobDriftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${selected}`
      )
      continue
    }

    const first = list[0]
    if (first) {
      map.set(
        card.id,
        `${jobDriftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${first}`
      )
    }
  }
  return map
})

const jobFilteredPayload = computed(() =>
  jobFilteredCards.value.map((card) => {
    const drift = jobDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      title: card.title,
      status: card.status,
      drift,
    }
  })
)

const jobAllJsonPayload = computed(() => ({
  totalJobs: jobs.value.length,
  jobs: jobs.value,
  driftById: Object.fromEntries(jobDriftById.value),
}))

const copyFilteredJobs = async () => {
  await copyJSON(
    {
      driftKind: jobDriftKind.value,
      selectedField: jobSelectedField.value || null,
      totalJobs: jobs.value.length,
      jobs: jobFilteredPayload.value,
    },
    { label: 'Dev · Jobs (Ext) · Jobs · Filtered drift' }
  )
}

// Professionals
const {
  globalProfessionals,
  localProfessionals,
  rawGlobalProfessionals,
  rawLocalProfessionals,
} = useProfessionalCollection()
const { card: makeProfessionalCard } = useProfessional()

const professionalGlobalRawCollection = computed<ProfessionalCore[]>(() =>
  safeArray<unknown>(rawGlobalProfessionals.value)
    .filter((x: any) => Boolean(x?.id)) as ProfessionalCore[]
)

const professionalGlobalEntryById = computed(() => {
  const map = new Map<string, any>()
  for (const entry of safeArray<unknown>(globalProfessionals.value)) {
    const id = (entry as any)?.id
    if (id) map.set(String(id), entry)
  }
  return map
})

const {
  driftKind: professionalGlobalDriftKind,
  setDriftKind: setProfessionalGlobalDriftKind,
  selectedField: professionalGlobalSelectedField,
  driftById: professionalGlobalDriftById,
  filterOptions: professionalGlobalFilterOptions,
  filteredCollection: professionalGlobalFilteredCollection,
} = useDevDriftFilter({
  collection: professionalGlobalRawCollection,
  runtimeModel: ProfessionalCoreRuntime as unknown as Record<string, unknown>,
})

const professionalGlobalFilteredCards = computed(() =>
  professionalGlobalFilteredCollection.value
    .map((raw) => {
      const entry = professionalGlobalEntryById.value.get(raw.id)
      return makeProfessionalCard(raw as any, (entry as any)?.user ?? null)
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const professionalGlobalFilteredPayload = computed(() =>
  professionalGlobalFilteredCards.value.map((card) => {
    const drift = professionalGlobalDriftById.value.get(card.id) ?? {
      missing: [],
      extra: [],
    }
    return { id: card.id, displayName: card.displayName, drift }
  })
)

const professionalGlobalAllJsonPayload = computed(() => ({
  totalProfessionals: professionalGlobalRawCollection.value.length,
  professionals: professionalGlobalRawCollection.value,
  driftById: Object.fromEntries(professionalGlobalDriftById.value),
}))

const copyProfessionalGlobalFiltered = async () => {
  await copyJSON(
    {
      driftKind: professionalGlobalDriftKind.value,
      selectedField: professionalGlobalSelectedField.value || null,
      totalProfessionals: professionalGlobalRawCollection.value.length,
      professionals: professionalGlobalFilteredPayload.value,
    },
    { label: 'Dev · Jobs (Ext) · Professionals · Global · Filtered drift' }
  )
}

const hasProfessionalLocalCollection = computed(() => Boolean(localProfessionals))

const professionalLocalRawCollection = computed<ProfessionalCore[]>(() => {
  if (!rawLocalProfessionals) return []
  return safeArray<unknown>(rawLocalProfessionals.value)
    .filter((x: any) => Boolean(x?.id)) as ProfessionalCore[]
})

const professionalLocalEntryById = computed(() => {
  const map = new Map<string, any>()
  if (!localProfessionals) return map
  for (const entry of safeArray<unknown>(localProfessionals.value)) {
    const id = (entry as any)?.id
    if (id) map.set(String(id), entry)
  }
  return map
})

const {
  driftKind: professionalLocalDriftKind,
  setDriftKind: setProfessionalLocalDriftKind,
  selectedField: professionalLocalSelectedField,
  driftById: professionalLocalDriftById,
  filterOptions: professionalLocalFilterOptions,
  filteredCollection: professionalLocalFilteredCollection,
} = useDevDriftFilter({
  collection: professionalLocalRawCollection,
  runtimeModel: ProfessionalCoreRuntime as unknown as Record<string, unknown>,
})

const professionalLocalFilteredCards = computed(() =>
  professionalLocalFilteredCollection.value
    .map((raw) => {
      const entry = professionalLocalEntryById.value.get(raw.id)
      return makeProfessionalCard(raw as any, (entry as any)?.user ?? null)
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const professionalLocalFilteredPayload = computed(() =>
  professionalLocalFilteredCards.value.map((card) => {
    const drift = professionalLocalDriftById.value.get(card.id) ?? {
      missing: [],
      extra: [],
    }
    return { id: card.id, displayName: card.displayName, drift }
  })
)

const professionalLocalAllJsonPayload = computed(() => ({
  totalProfessionals: professionalLocalRawCollection.value.length,
  professionals: professionalLocalRawCollection.value,
  driftById: Object.fromEntries(professionalLocalDriftById.value),
}))

const copyProfessionalLocalFiltered = async () => {
  await copyJSON(
    {
      driftKind: professionalLocalDriftKind.value,
      selectedField: professionalLocalSelectedField.value || null,
      totalProfessionals: professionalLocalRawCollection.value.length,
      professionals: professionalLocalFilteredPayload.value,
    },
    { label: 'Dev · Jobs (Ext) · Professionals · Tenant · Filtered drift' }
  )
}

// Agents
const { globalAgents, localAgents, rawGlobalAgents, rawLocalAgents } =
  useAgentCollection()
const { card: makeAgentCard } = useAgentsInterface()

const agentGlobalRawCollection = computed<AgentCore[]>(() =>
  safeArray<unknown>(rawGlobalAgents.value)
    .filter((x: any) => Boolean(x?.id)) as AgentCore[]
)

const agentGlobalEntryById = computed(() => {
  const map = new Map<string, AgentDirectoryEntry>()
  for (const entry of safeArray<unknown>(globalAgents.value) as AgentDirectoryEntry[]) {
    const id = (entry as any)?.id
    if (id) map.set(String(id), entry)
  }
  return map
})

const {
  driftKind: agentGlobalDriftKind,
  setDriftKind: setAgentGlobalDriftKind,
  selectedField: agentGlobalSelectedField,
  driftById: agentGlobalDriftById,
  filterOptions: agentGlobalFilterOptions,
  filteredCollection: agentGlobalFilteredCollection,
} = useDevDriftFilter({
  collection: agentGlobalRawCollection,
  runtimeModel: AgentCoreRuntime as unknown as Record<string, unknown>,
})

const agentGlobalFilteredCards = computed(() =>
  agentGlobalFilteredCollection.value
    .map((raw) => {
      const entry = agentGlobalEntryById.value.get(raw.id)
      return makeAgentCard((entry ?? (raw as any)) as any)
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const agentGlobalFilteredPayload = computed(() =>
  agentGlobalFilteredCards.value.map((card) => {
    const drift = agentGlobalDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return { id: card.id, displayName: card.displayName, drift }
  })
)

const agentGlobalAllJsonPayload = computed(() => ({
  totalAgents: agentGlobalRawCollection.value.length,
  agents: agentGlobalRawCollection.value,
  driftById: Object.fromEntries(agentGlobalDriftById.value),
}))

const copyAgentGlobalFiltered = async () => {
  await copyJSON(
    {
      driftKind: agentGlobalDriftKind.value,
      selectedField: agentGlobalSelectedField.value || null,
      totalAgents: agentGlobalRawCollection.value.length,
      agents: agentGlobalFilteredPayload.value,
    },
    { label: 'Dev · Jobs (Ext) · Agents · Global · Filtered drift' }
  )
}

const hasAgentLocalCollection = computed(() => Boolean(localAgents))

const agentLocalRawCollection = computed<AgentCore[]>(() => {
  if (!rawLocalAgents) return []
  return safeArray<unknown>(rawLocalAgents.value)
    .filter((x: any) => Boolean(x?.id)) as AgentCore[]
})

const agentLocalEntryById = computed(() => {
  const map = new Map<string, AgentDirectoryEntry>()
  if (!localAgents) return map
  for (const entry of safeArray<unknown>(localAgents.value) as AgentDirectoryEntry[]) {
    const id = (entry as any)?.id
    if (id) map.set(String(id), entry)
  }
  return map
})

const {
  driftKind: agentLocalDriftKind,
  setDriftKind: setAgentLocalDriftKind,
  selectedField: agentLocalSelectedField,
  driftById: agentLocalDriftById,
  filterOptions: agentLocalFilterOptions,
  filteredCollection: agentLocalFilteredCollection,
} = useDevDriftFilter({
  collection: agentLocalRawCollection,
  runtimeModel: AgentCoreRuntime as unknown as Record<string, unknown>,
})

const agentLocalFilteredCards = computed(() =>
  agentLocalFilteredCollection.value
    .map((raw) => {
      const entry = agentLocalEntryById.value.get(raw.id)
      return makeAgentCard((entry ?? (raw as any)) as any)
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const agentLocalFilteredPayload = computed(() =>
  agentLocalFilteredCards.value.map((card) => {
    const drift = agentLocalDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return { id: card.id, displayName: card.displayName, drift }
  })
)

const agentLocalAllJsonPayload = computed(() => ({
  totalAgents: agentLocalRawCollection.value.length,
  agents: agentLocalRawCollection.value,
  driftById: Object.fromEntries(agentLocalDriftById.value),
}))

const copyAgentLocalFiltered = async () => {
  await copyJSON(
    {
      driftKind: agentLocalDriftKind.value,
      selectedField: agentLocalSelectedField.value || null,
      totalAgents: agentLocalRawCollection.value.length,
      agents: agentLocalFilteredPayload.value,
    },
    { label: 'Dev · Jobs (Ext) · Agents · Tenant · Filtered drift' }
  )
}
</script>
