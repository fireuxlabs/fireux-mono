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
                v-if="professionalCell"
                :professional="professionalCell"
              />
              <OrganismsProfilesProfessionalCardsPill
                v-if="professionalPill"
                :professional="professionalPill"
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
              v-for="pill in professionalGlobalPills"
              :key="professionalPillKey(pill)"
              :professional="pill"
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
              v-for="pill in professionalLocalPills"
              :key="professionalPillKey(pill)"
              :professional="pill"
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
              <OrganismsProfilesAgentCardsCell v-if="agentCell" :agent="agentCell" />
              <OrganismsProfilesAgentCardsPill v-if="agentPill" :agent="agentPill" />
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
              v-for="pill in agentGlobalPills"
              :key="agentPillKey(pill)"
              :agent="pill"
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
              v-for="pill in agentLocalPills"
              :key="agentPillKey(pill)"
              :agent="pill"
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
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import DevProfileDiffList from 'fireux-core/runtime/components/dev/ProfileDiffList.vue'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'
import { useAgent } from '../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import { useAgentCollection } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentCollection.ts'
import {
  resolveProfessionalPill,
  resolveProfessionalPillKey,
} from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface'
import type { ProfessionalProfile } from '../../models/profiles/Professional/Professional.model'
import type { ProfessionalCard } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface'
import type { AgentProfile } from '../../models/profiles/Agent/Agent.model'
import type { AgentCard } from '../../composables/fireux/firestore/profiles/Agent/main/useAgentInterface'

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
  pill: professionalPill,
  cell: professionalCell,
} = useProfessional()

const {
  coreProfile: agentCoreProfile,
  appProfile: agentAppProfile,
  pill: agentPill,
  cell: agentCell,
} = useAgent()

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

const professionalGlobalPills = computed<ProfessionalCard.ProfessionalPill[]>(() =>
  (globalProfessionals.value ?? []).map((profile: ProfessionalProfile) =>
    resolveProfessionalPill(profile)
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

const professionalLocalPills = computed<ProfessionalCard.ProfessionalPill[]>(() => {
  if (!localProfessionals) return []
  return (localProfessionals.value ?? []).map((profile: ProfessionalProfile) =>
    resolveProfessionalPill(profile)
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

const professionalPillKey = resolveProfessionalPillKey

const { globalAgents, localAgents, rawGlobalAgents, rawLocalAgents } =
  useAgentCollection()

type AgentPreviewProfile = Partial<AgentProfile> & {
  user?: { display_name?: string | null; avatar?: string | null } | null
  display_name?: string | null
  avatar_url?: string | null
  avatar?: string | null
}

const toAgentPill = (
  profile?: AgentPreviewProfile | null
): AgentCard.AgentPill => {
  const title = (
    profile?.title ||
    profile?.user?.display_name ||
    profile?.display_name ||
    ''
  ).trim()
  const normalizedTitle = title || 'Agent'
  const tagline =
    profile?.tagline ??
    (profile as { subtitle?: string | null })?.subtitle ??
    ''
  const avatar =
    profile?.avatar_url || profile?.avatar || profile?.user?.avatar || ''
  const rawBadges = profile?.badges
  const badges = Array.isArray(rawBadges) ? rawBadges : []
  const to = profile?.id ? `/agents/${profile.id}` : null

  return {
    avatar,
    title: normalizedTitle,
    subtitle: tagline,
    tagline,
    badges,
    to,
  }
}

const agentGlobalPills = computed<AgentCard.AgentPill[]>(() =>
  (globalAgents.value ?? []).map((profile: AgentProfile) =>
    toAgentPill(profile)
  )
)

const agentGlobalCount = computed(() => agentGlobalPills.value.length)

const agentGlobalJson = computed(() => rawGlobalAgents.value ?? [])

const hasAgentLocalCollection = computed(() => Boolean(localAgents))

const agentLocalPills = computed<AgentCard.AgentPill[]>(() => {
  if (!localAgents) return []
  return (localAgents.value ?? []).map((profile: AgentProfile) =>
    toAgentPill(profile)
  )
})

const agentLocalCount = computed(() => agentLocalPills.value.length)

const agentLocalJson = computed(() =>
  localAgents && rawLocalAgents ? rawLocalAgents.value ?? [] : []
)

const agentPillKey = (pill: AgentCard.AgentPill) => pill.to ?? pill.title ?? 'agent'

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
</script>
