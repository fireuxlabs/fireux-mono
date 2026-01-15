<template>
  <UPage>
    <UPageHeader
      title="FireUX Jobs Profiles"
      description="Debug the active professional and agent profiles with no inferred fallbacks."
    />

    <UPageBody class="space-y-10">
      <section class="space-y-4">
        <header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Professional
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Mirrors the main Professionals page and shows data only when a
            professional profile is resolved for this runtime.
          </p>
        </header>

        <div v-if="professionalHasProfile" class="space-y-6">
          <UCard>
            <template #header>
              <h2>Professional profile</h2>
            </template>

            <div class="space-y-4">
              <OrganismsProfilesProfessionalCardsCell
                v-if="professionalCard"
                :card="professionalCard"
              />
              <OrganismsProfilesProfessionalCardsPill
                v-if="professionalCard"
                v-bind="professionalCard"
              />
            </div>
          </UCard>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No professional profile loaded.
        </p>

        <DevJsonPanel v-if="professionalJson" :data="professionalJson" />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Global professionals
              </h3>
              <UBadge variant="soft"
                >{{ professionalGlobalCount }} total</UBadge
              >
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pulled directly from the shared professionals collection.
            </p>
          </template>

          <div
            v-if="professionalGlobalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesProfessionalCardsPill
              v-for="card in professionalGlobalPills"
              :key="professionalPillKey(card)"
              v-bind="card"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No global professionals found.
          </p>

          <template #footer>
            <div class="space-y-4">
              <DevProfileDiffList
                :rows="professionalGlobalDiffRows"
                title="Raw vs enriched (global)"
                empty-text="Load global professionals to inspect the collection."
              />
              <DevJsonPanel
                v-if="professionalGlobalJson.length"
                :data="professionalGlobalJson"
                title="Global professionals (raw)"
              />
            </div>
          </template>
        </UCard>

        <UCard v-if="isTenant && hasProfessionalLocalCollection">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant professionals
              </h3>
              <UBadge variant="soft">{{ professionalLocalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Scoped to the active tenant application.
            </p>
          </template>

          <div
            v-if="professionalLocalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesProfessionalCardsPill
              v-for="card in professionalLocalPills"
              :key="professionalPillKey(card)"
              v-bind="card"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No tenant-scoped professionals found.
          </p>

          <template #footer>
            <div class="space-y-4">
              <DevProfileDiffList
                :rows="professionalLocalDiffRows"
                title="Raw vs enriched (tenant)"
                empty-text="No tenant-specific professionals detected."
              />
              <DevJsonPanel
                v-if="professionalLocalJson.length"
                :data="professionalLocalJson"
                title="Tenant professionals (raw)"
              />
            </div>
          </template>
        </UCard>
        <UCard v-else-if="isTenant">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant professionals
              </h3>
              <UBadge variant="soft">0 total</UBadge>
            </div>
          </template>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Tenant-overridden collection is not available in this runtime.
          </p>
        </UCard>
      </section>

      <section class="space-y-4">
        <header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Agent
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Reflects the active agent profile with the same surface used in the
            runtime app.
          </p>
        </header>

        <div v-if="agentHasProfile" class="space-y-6">
          <UCard>
            <template #header>
              <h2>Agent profile</h2>
            </template>

            <div class="space-y-4">
              <OrganismsProfilesAgentCardsCell v-if="agentCard" v-bind="agentCard" />
              <OrganismsProfilesAgentCardsPill v-if="agentCard" v-bind="agentCard" />
            </div>
          </UCard>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No agent profile loaded.
        </p>

        <DevJsonPanel v-if="agentJson" :data="agentJson" />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Global agents
              </h3>
              <UBadge variant="soft">{{ agentGlobalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Agents available across the shared directory.
            </p>
          </template>

          <div
            v-if="agentGlobalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesAgentCardsPill
              v-for="card in agentGlobalPills"
              :key="agentPillKey(card)"
              v-bind="card"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No global agents found.
          </p>

          <template #footer>
            <div class="space-y-4">
              <DevProfileDiffList
                :rows="agentGlobalDiffRows"
                title="Raw vs enriched (global)"
                empty-text="Load global agents to inspect the collection."
              />
              <DevJsonPanel
                v-if="agentGlobalJson.length"
                :data="agentGlobalJson"
                title="Global agents (raw)"
              />
            </div>
          </template>
        </UCard>

        <UCard v-if="isTenant && hasAgentLocalCollection">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant agents
              </h3>
              <UBadge variant="soft">{{ agentLocalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Agent overrides scoped to the active tenant.
            </p>
          </template>

          <div
            v-if="agentLocalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesAgentCardsPill
              v-for="card in agentLocalPills"
              :key="agentPillKey(card)"
              v-bind="card"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No tenant-scoped agents found.
          </p>

          <template #footer>
            <div class="space-y-4">
              <DevProfileDiffList
                :rows="agentLocalDiffRows"
                title="Raw vs enriched (tenant)"
                empty-text="No tenant-specific agents detected."
              />
              <DevJsonPanel
                v-if="agentLocalJson.length"
                :data="agentLocalJson"
                title="Tenant agents (raw)"
              />
            </div>
          </template>
        </UCard>
        <UCard v-else-if="isTenant">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant agents
              </h3>
              <UBadge variant="soft">0 total</UBadge>
            </div>
          </template>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Tenant agent collection is not available in this runtime.
          </p>
        </UCard>
      </section>

      <section class="space-y-4">
        <header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Jobs
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Collection-first view; filter by missing or extra fields (against the runtime Job model).
          </p>
        </header>

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
            v-if="!filteredJobCards.length"
            color="neutral"
            variant="soft"
            icon="i-lucide-inbox"
            title="No matching jobs"
            description="Adjust filters or add job documents to Firestore."
          />

          <div v-else class="grid gap-3 md:grid-cols-2">
            <OrganismsObjectsJobCardsCell
              v-for="card in filteredJobCards"
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

        <div class="flex justify-end">
          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document'"
            @click="copyAllJobs"
          >
            {{ copying ? 'Copying…' : 'Copy all (JSON)' }}
          </UButton>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import DevProfileDiffList from 'fireux-core/runtime/components/dev/ProfileDiffList.vue'
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import {
    humanizeDriftPath,
    resolveDriftFromModel,
    type DriftKind,
    type ModelDrift,
} from 'fireux-core/runtime/composables/dev/useModelDrift'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { ref, watch } from 'vue'
import { useJobCollection } from '../../composables/fireux/firestore/jobs/fetch/useJobCollection'
import { useJobInterface } from '../../composables/fireux/firestore/jobs/utils/view/useJobInterface'
import { useAgentCollection } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection'
import type { AgentCard } from '../../composables/fireux/firestore/profiles/Agent/useAgent'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection'
import type { ProfessionalCard } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import type { Job as JobModel } from '../../models/objects/job.model'
import { Job as JobModelRuntime } from '../../models/objects/job.model'

type Ref<T> = { value: T }

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

const {
  coreProfile: professionalCoreProfile,
  appProfile: professionalAppProfile,
  card: resolveProfessionalCard,
} = useProfessional()

const {
  coreProfile: agentCoreProfile,
  appProfile: agentAppProfile,
  card: resolveAgentCard,
} = useAgent()

const professionalCard = computed<ProfessionalCard.Card | null>(() => {
  const core = professionalCoreProfile.value
  return core ? resolveProfessionalCard(core as any) : null
})

const agentCard = computed<AgentCard.Card | null>(() => {
  const core = agentCoreProfile.value
  return core ? resolveAgentCard(core as any) : null
})

const professionalHasProfile = computed(
  () => Boolean(professionalCoreProfile.value)
)

const agentHasProfile = computed(() => Boolean(agentCoreProfile.value))

const professionalJson = computed(() => {
  const core = professionalCoreProfile.value
  const app = professionalAppProfile.value
  if (!core && !app) return null
  return {
    coreProfile: core,
    appProfile: app,
  }
})

const agentJson = computed(() => {
  const core = agentCoreProfile.value
  const app = agentAppProfile.value
  if (!core && !app) return null
  return {
    coreProfile: core,
    appProfile: app,
  }
})

const { isTenant } = useFireUXConfig()

const {
  globalProfessionals,
  localProfessionals,
  rawGlobalProfessionals,
  rawLocalProfessionals,
} = useProfessionalCollection()

const professionalGlobalPills = computed<ProfessionalCard.Card[]>(() =>
  (globalProfessionals.value ?? []).map((profile) =>
    resolveProfessionalCard(profile as any)
  )
)

const professionalGlobalCount = computed(
  () => professionalGlobalPills.value.length
)

const professionalGlobalJson = computed(
  () => rawGlobalProfessionals.value ?? []
)

const hasProfessionalLocalCollection = computed(() =>
  Boolean(localProfessionals)
)

const professionalLocalPills = computed<ProfessionalCard.Card[]>(() => {
  if (!localProfessionals) return []
  return (localProfessionals.value ?? []).map((profile) =>
    resolveProfessionalCard(profile as any)
  )
})

const professionalLocalCount = computed(
  () => professionalLocalPills.value.length
)

const professionalLocalJson = computed(() =>
  localProfessionals && rawLocalProfessionals
    ? rawLocalProfessionals.value ?? []
    : []
)

const professionalPillKey = (card: ProfessionalCard.Card) =>
  card.id || card.to || card.displayName || 'professional'

const { globalAgents, localAgents, rawGlobalAgents, rawLocalAgents } =
  useAgentCollection()

const agentGlobalPills = computed<AgentCard.Card[]>(() =>
  (globalAgents.value ?? []).map((profile) => resolveAgentCard(profile as any))
)

const agentGlobalCount = computed(() => agentGlobalPills.value.length)

const agentGlobalJson = computed(() => rawGlobalAgents.value ?? [])

const hasAgentLocalCollection = computed(() => Boolean(localAgents))

const agentLocalPills = computed<AgentCard.Card[]>(() => {
  if (!localAgents) return []
  return (localAgents.value ?? []).map((profile) => resolveAgentCard(profile as any))
})

const agentLocalCount = computed(() => agentLocalPills.value.length)

const agentLocalJson = computed(() =>
  localAgents && rawLocalAgents ? rawLocalAgents.value ?? [] : []
)

const agentPillKey = (card: AgentCard.Card) =>
  card.id || card.to || card.displayName || 'agent'

type ProfileDiffRow<TProfile> = {
  id: string
  raw: Partial<TProfile> | null
  enriched: Partial<TProfile> | null
  issues: string[]
}

interface ProfileModelSpec {
  typeLabel: string
  requireUser?: boolean
}

type MaybeProfileEntries<TProfile> = Ref<
  Array<Partial<TProfile>> | null | undefined
> | null

const resolveProfileId = (
  profile?: Partial<{
    id?: string | null
    user?: { id?: string | null } | null
  }> | null
) => {
  if (!profile) return null
  const profileId = (profile as { id?: string | null }).id
  if (profileId) return profileId
  return (profile as { user?: { id?: string | null } }).user?.id ?? null
}

const collectProfileIssues = (
  raw: Record<string, any> | null | undefined,
  enriched: Record<string, any> | null | undefined,
  spec: ProfileModelSpec
) => {
  const issues: string[] = []

  if (!raw) {
    issues.push(`${spec.typeLabel} document missing`)
    return issues
  }

  const id = resolveProfileId(raw)
  if (!id) {
    issues.push('Missing profile id')
  }

  const requireUser = spec.requireUser !== false
  const user = raw.user

  if (requireUser) {
    if (!user) {
      issues.push('Missing linked user reference')
    } else {
      if (!user.id) {
        issues.push('Missing linked user id')
      }
      if (raw.id && user.id && raw.id !== user.id) {
        issues.push('Profile id and user id mismatch')
      }
    }
  }

  if (!enriched) {
    issues.push('Profile missing from enriched collection')
    return issues
  }

  if (requireUser) {
    const enrichedUser = enriched.user
    if (!enrichedUser) {
      issues.push('Enriched payload missing user data')
    } else {
      if (!enrichedUser.display_name) {
        issues.push('Enriched user missing display name')
      }
      if (!enrichedUser.avatar) {
        issues.push('Enriched user missing avatar')
      }
    }
  }

  return issues
}

const toEntriesArray = <TProfile>(
  source: MaybeProfileEntries<TProfile>
): Partial<TProfile>[] => {
  if (!source) return []
  const value = source.value
  return Array.isArray(value) ? (value as Partial<TProfile>[]) : []
}

const buildProfileDiffRows = <TProfile>(
  rawSource: MaybeProfileEntries<TProfile>,
  enrichedSource: MaybeProfileEntries<TProfile>,
  spec: ProfileModelSpec
) =>
  computed<ProfileDiffRow<TProfile>[]>(() => {
    const rawEntries = toEntriesArray(rawSource)
    if (!rawEntries.length) return []

    const enrichedEntries = toEntriesArray(enrichedSource)
    const enrichedMap = new Map<string, Partial<TProfile>>()

    for (const entry of enrichedEntries) {
      const id = resolveProfileId(entry)
      if (id) {
        enrichedMap.set(id, entry)
      }
    }

    return rawEntries.map((raw) => {
      const id = resolveProfileId(raw) ?? 'unknown-profile'
      const enriched = id ? enrichedMap.get(id) ?? null : null

      return {
        id,
        raw: raw ?? null,
        enriched,
        issues: collectProfileIssues(raw as any, enriched as any, spec),
      }
    })
  })

const professionalModelSpec: ProfileModelSpec = {
  typeLabel: 'Professional',
}

const agentModelSpec: ProfileModelSpec = {
  typeLabel: 'Agent',
}

const professionalGlobalDiffRows = buildProfileDiffRows(
  rawGlobalProfessionals,
  globalProfessionals,
  professionalModelSpec
)

const professionalLocalDiffRows = buildProfileDiffRows(
  rawLocalProfessionals,
  localProfessionals,
  professionalModelSpec
)

const agentGlobalDiffRows = buildProfileDiffRows(
  rawGlobalAgents,
  globalAgents,
  agentModelSpec
)

const agentLocalDiffRows = buildProfileDiffRows(
  rawLocalAgents,
  localAgents,
  agentModelSpec
)

const { copyJSON, copying } = useDevClipboard()

const { appJobs } = useJobCollection()
const jobs = computed<JobModel[]>(() => appJobs.value ?? [])

const { card: makeJobCard } = useJobInterface()
const jobCards = computed(() =>
  jobs.value
    .map((job) => makeJobCard(job))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const jobDriftKind = ref<DriftKind>('missing')
const jobSelectedField = ref<string>('')

const setJobDriftKind = (kind: DriftKind) => {
  jobDriftKind.value = kind
}

watch(jobDriftKind, () => {
  jobSelectedField.value = ''
})

const jobDriftById = computed(() => {
  const map = new Map<string, ModelDrift>()
  for (const job of jobs.value) {
    if (!job?.id) continue
    const drift = resolveDriftFromModel(
      JobModelRuntime as unknown as Record<string, unknown>,
      job as unknown as Record<string, unknown>
    )
    map.set(job.id, drift)
  }
  return map
})

const jobFieldOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const drift of jobDriftById.value.values()) {
    const list = jobDriftKind.value === 'missing' ? drift.missing : drift.extra
    for (const field of list) counts.set(field, (counts.get(field) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, label: `${humanizeDriftPath(key)} (${count})` }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const jobFilterOptions = computed(() => [
  { label: 'All', value: '' },
  ...jobFieldOptions.value.map((o) => ({ label: o.label, value: o.key })),
])

const filteredJobCards = computed(() => {
  if (!jobSelectedField.value) return jobCards.value

  return jobCards.value.filter((card) => {
    const drift = jobDriftById.value.get(card.id)
    if (!drift) return false
    const list = jobDriftKind.value === 'missing' ? drift.missing : drift.extra
    return list.includes(jobSelectedField.value)
  })
})

const jobTaglineById = computed(() => {
  const map = new Map<string, string>()
  for (const card of jobCards.value) {
    const drift = jobDriftById.value.get(card.id)
    if (!drift) continue
    const list = jobDriftKind.value === 'missing' ? drift.missing : drift.extra

    const selected = jobSelectedField.value
    if (selected && list.includes(selected)) {
      map.set(
        card.id,
        `${jobDriftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${humanizeDriftPath(selected)}`
      )
      continue
    }

    const first = list[0]
    if (first) {
      map.set(
        card.id,
        `${jobDriftKind.value === 'missing' ? 'Missing' : 'Extra'}: ${humanizeDriftPath(first)}`
      )
    }
  }
  return map
})

const filteredJobsPayload = computed(() =>
  filteredJobCards.value.map((card) => {
    const drift = jobDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      title: card.title,
      status: card.status,
      drift,
    }
  })
)

const copyFilteredJobs = async () => {
  await copyJSON(
    {
      driftKind: jobDriftKind.value,
      selectedField: jobSelectedField.value || null,
      totalJobs: jobs.value.length,
      jobs: filteredJobsPayload.value,
    },
    { label: 'Dev · Jobs (Ext) · Filtered drift' }
  )
}

const copyAllJobs = async () => {
  await copyJSON(
    {
      totalJobs: jobs.value.length,
      jobs: jobs.value,
      driftById: Object.fromEntries(jobDriftById.value),
    },
    { label: 'Dev · Jobs (Ext)' }
  )
}
</script>
