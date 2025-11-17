<template>
  <UPage>
    <UPageHeader
      title="FireUX Jobs Profiles"
      description="Debug the active professional and employer profiles with no inferred fallbacks."
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
            Employer
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Reflects the active employer profile with the same surface used in
            the runtime app.
          </p>
        </header>

        <OrganismsProfilesEmployerSectionsSingle
          :core-profile="employerCoreProfile"
          :app-profile="employerAppProfile"
          :pill="employerPill"
        />

        <DevJsonPanel v-if="employerJson" :data="employerJson" />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Global employers
              </h3>
              <UBadge variant="soft">{{ employerGlobalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Employers available across the shared directory.
            </p>
          </template>

          <div
            v-if="employerGlobalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesEmployerCardsPill
              v-for="pill in employerGlobalPills"
              :key="employerPillKey(pill)"
              :employer="pill"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No global employers found.
          </p>

          <template #footer>
            <DevJsonPanel
              v-if="employerGlobalJson.length"
              :data="employerGlobalJson"
            />
          </template>
        </UCard>

        <UCard v-if="isTenant && hasEmployerLocalCollection">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant employers
              </h3>
              <UBadge variant="soft">{{ employerLocalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Employer overrides scoped to the active tenant.
            </p>
          </template>

          <div
            v-if="employerLocalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesEmployerCardsPill
              v-for="pill in employerLocalPills"
              :key="employerPillKey(pill)"
              :employer="pill"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No tenant-scoped employers found.
          </p>

          <template #footer>
            <DevJsonPanel
              v-if="employerLocalJson.length"
              :data="employerLocalJson"
            />
          </template>
        </UCard>
        <UCard v-else-if="isTenant">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant employers
              </h3>
              <UBadge variant="soft">0 total</UBadge>
            </div>
          </template>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Tenant employer collection is not available in this runtime.
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
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'
import { useProfessionalCollection } from '../../composables/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import { useEmployerCollection } from '../../composables/firestore/profiles/Employer/main/useEmployerCollection.ts'
import {
  resolveProfessionalPill,
  resolveProfessionalPillKey,
} from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../models/profiles/Professional.model.ts'
import type {
  EmployerProfile,
  EmployerCard,
} from '../../models/profiles/Employer.model.ts'

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
  coreProfile: employerCoreProfile,
  appProfile: employerAppProfile,
  pill: employerPill,
} = useEmployer()

const professionalJson = computed(() => {
  const core = unref(professionalCoreProfile)
  const app = unref(professionalAppProfile)
  if (!core && !app) return null
  return {
    coreProfile: core,
    appProfile: app,
  }
})

const employerJson = computed(() => {
  const core = unref(employerCoreProfile)
  const app = unref(employerAppProfile)
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
  globalEmployers,
  localEmployers,
  rawGlobalEmployers,
  rawLocalEmployers,
} = useEmployerCollection()

const toEmployerPill = (
  profile?: Partial<EmployerProfile> | null
): EmployerCard.Pill => {
  const title = (profile?.title || profile?.organization_name || '').trim()
  const normalizedTitle = title || 'Employer'
  const subtitle = profile?.subtitle ?? ''
  const avatar = profile?.avatar_url || profile?.avatar || ''
  const rawBadges = profile?.badges
  const badges = Array.isArray(rawBadges) ? rawBadges : []
  const to = profile?.id ? `/employers/${profile.id}` : null

  return {
    avatar,
    title: normalizedTitle,
    subtitle,
    badges,
    to,
  }
}

const employerGlobalPills = computed<EmployerCard.Pill[]>(() =>
  (globalEmployers.value ?? []).map((profile: EmployerProfile) =>
    toEmployerPill(profile)
  )
)

const employerGlobalCount = computed(() => employerGlobalPills.value.length)

const employerGlobalJson = computed(() => rawGlobalEmployers.value ?? [])

const hasEmployerLocalCollection = computed(() => Boolean(localEmployers))

const employerLocalPills = computed<EmployerCard.Pill[]>(() => {
  if (!localEmployers) return []
  return (localEmployers.value ?? []).map((profile: EmployerProfile) =>
    toEmployerPill(profile)
  )
})

const employerLocalCount = computed(() => employerLocalPills.value.length)

const employerLocalJson = computed(() =>
  localEmployers && rawLocalEmployers ? rawLocalEmployers.value ?? [] : []
)

const employerPillKey = (pill: EmployerCard.Pill) =>
  pill.to ?? pill.title ?? 'employer'
</script>
