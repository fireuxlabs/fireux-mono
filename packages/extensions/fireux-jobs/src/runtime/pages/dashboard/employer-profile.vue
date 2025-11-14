<!-- packages/extensions/fireux-jobs/src/runtime/pages/dashboard/employer-profile.vue -->
<template>
  <LayoutsDashboardEditStructure
    title="Employer Profile"
    description="Keep your employer brand details up to date."
    :dev-data="employerRecord"
  >
    <UPageCard
      v-if="currentEmployerProfileCard && employerRecord"
      variant="subtle"
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <JobProfilesEmployerCardsPill
              v-if="currentEmployerPill"
              :employer="currentEmployerPill"
            />
            <OrganismsProfilesEmployerCardsCell
              v-if="currentEmployerCell"
              :employer="currentEmployerCell"
            />
          </div>

          <JobProfilesEmployerCardsProfile
            :employer="currentEmployerProfileCard"
          />
        </div>

        <JobProfilesEmployerEdit :employer="employerRecord" />
      </div>
    </UPageCard>

    <UCard v-else>
      <p class="fallback">error</p>
    </UCard>
  </LayoutsDashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import type {
  Employer,
  EmployerProfile,
} from '../../models/profiles/Employer.model'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer'
import { useEmployerInterface } from '../../composables/firestore/profiles/Employer/main/useEmployerInterface'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-employer-profile',
    label: 'Employer Profile',
    icon: 'i-lucide-briefcase-business',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'employer',
  },
  requiresAuth: true,
})

const { profile } = useEmployer()
const { pillProps, cellProps, profileProps } = useEmployerInterface(profile)

const coreEmployer = computed<EmployerProfile | null>(
  () =>
    (profile.coreProfile.value as EmployerProfile | null | undefined) ?? null
)
const appEmployer = computed<EmployerProfile | null>(
  () => (profile.appProfile.value as EmployerProfile | null | undefined) ?? null
)

const mergedEmployer = computed<EmployerProfile | null>(() => {
  const core = coreEmployer.value
  const overlay = appEmployer.value
  if (!core && !overlay) return null
  const merged: EmployerProfile = {} as EmployerProfile
  if (core) Object.assign(merged, core)
  if (overlay) Object.assign(merged, overlay)
  return merged
})

const hasEmployerProfile = computed(() => Boolean(mergedEmployer.value))

const currentEmployerPill = computed(() =>
  hasEmployerProfile.value ? pillProps(mergedEmployer.value ?? undefined) : null
)
const currentEmployerCell = computed(() =>
  hasEmployerProfile.value ? cellProps(mergedEmployer.value ?? undefined) : null
)
const currentEmployerProfileCard = computed(() =>
  hasEmployerProfile.value
    ? profileProps(mergedEmployer.value ?? undefined)
    : null
)

const employerRecord = computed<Employer | null>(() => {
  const merged = mergedEmployer.value
  if (!merged) return null
  const displayName =
    merged.display_name ??
    merged.title ??
    merged.organization_name ??
    'Employer'
  return {
    id: merged.id ?? '',
    display_name: displayName,
    avatar: merged.avatar ?? merged.avatar_url ?? undefined,
    core: coreEmployer.value,
    app: appEmployer.value ?? null,
  }
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}
</style>
