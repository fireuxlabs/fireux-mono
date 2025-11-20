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

        <OrganismsProfilesProfessionalSectionsSingle
          :core-profile="professionalCoreProfile"
          :app-profile="professionalAppProfile"
          :pill="professionalPill"
        />

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
            <DevJsonPanel
              v-if="professionalGlobalJson.length"
              :data="professionalGlobalJson"
            />
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
            <DevJsonPanel
              v-if="professionalLocalJson.length"
              :data="professionalLocalJson"
            />
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
            Reflects the active agent profile with the same surface used in
            the runtime app.
          </p>
        </header>

        <OrganismsProfilesAgentSectionsSingle
          :core-profile="agentCoreProfile"
          :app-profile="agentAppProfile"
          :pill="agentPill"
        />

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
            <DevJsonPanel
              v-if="agentGlobalJson.length"
              :data="agentGlobalJson"
            />
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
            <DevJsonPanel
              v-if="agentLocalJson.length"
              :data="agentLocalJson"
            />
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
import { computed, unref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useAgent } from '../../composables/firestore/profiles/Agent/useAgent.ts'
import { useProfessionalCollection } from '../../composables/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import { useAgentCollection } from '../../composables/firestore/profiles/Agent/main/useAgentCollection.ts'
import {
  resolveProfessionalPill,
  resolveProfessionalPillKey,
} from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../models/profiles/Professional.model.ts'
import type {
  AgentProfile,
  AgentCard,
} from '../../models/profiles/Agent.model.ts'

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
} = useProfessional()

const {
  coreProfile: agentCoreProfile,
  appProfile: agentAppProfile,
  pill: agentPill,
} = useAgent()

const professionalJson = computed(() => {
  const core = unref(professionalCoreProfile)
  const app = unref(professionalAppProfile)
  if (!core && !app) return null
  return {
    coreProfile: core,
    appProfile: app,
  }
})

const agentJson = computed(() => {
  const core = unref(agentCoreProfile)
  const app = unref(agentAppProfile)
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

const professionalGlobalPills = computed<ProfessionalCard.Pill[]>(() =>
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

const professionalLocalPills = computed<ProfessionalCard.Pill[]>(() => {
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

const {
  globalAgents,
  localAgents,
  rawGlobalAgents,
  rawLocalAgents,
} = useAgentCollection()

const toAgentPill = (
  profile?: Partial<AgentProfile> | null
): AgentCard.Pill => {
  const title = (profile?.title || profile?.organization_name || '').trim()
  const normalizedTitle = title || 'Agent'
  const subtitle = profile?.subtitle ?? ''
  const avatar = profile?.avatar_url || profile?.avatar || ''
  const rawBadges = profile?.badges
  const badges = Array.isArray(rawBadges) ? rawBadges : []
  const to = profile?.id ? `/agents/${profile.id}` : null

  return {
    avatar,
    title: normalizedTitle,
    subtitle,
    badges,
    to,
  }
}

const agentGlobalPills = computed<AgentCard.Pill[]>(() =>
  (globalAgents.value ?? []).map((profile: AgentProfile) =>
    toAgentPill(profile)
  )
)

const agentGlobalCount = computed(() => agentGlobalPills.value.length)

const agentGlobalJson = computed(() => rawGlobalAgents.value ?? [])

const hasAgentLocalCollection = computed(() => Boolean(localAgents))

const agentLocalPills = computed<AgentCard.Pill[]>(() => {
  if (!localAgents) return []
  return (localAgents.value ?? []).map((profile: AgentProfile) =>
    toAgentPill(profile)
  )
})

const agentLocalCount = computed(() => agentLocalPills.value.length)

const agentLocalJson = computed(() =>
  localAgents && rawLocalAgents ? rawLocalAgents.value ?? [] : []
)

const agentPillKey = (pill: AgentCard.Pill) =>
  pill.to ?? pill.title ?? 'agent'
</script>
