packages/extensions/fireux-jobs/src/runtime/pages/dashboard/employer-profile.vue
<template>
  <DashboardEditStructure
    title="Employer Profile"
    description="Keep your employer brand details up to date."
    :hero="hero"
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
      <div class="empty-state">
        <UIcon name="i-lucide-briefcase-business" class="empty-icon" />
        <h3 class="empty-title">Set up your employer profile</h3>
        <p class="empty-copy">
          Create your employer presence to manage listings and brand details.
        </p>
        <UButton color="primary" :loading="creating" @click="onEnsure">
          Create Employer Profile
        </UButton>
      </div>
    </UCard>
  </DashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import { type Employer } from '../../models/profiles/Employer.model'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer'
import { useEmployerComputed } from '../../composables/firestore/profiles/Employer/main/useEmployerComputed'
import { useEmployerInterface } from '../../composables/firestore/profiles/Employer/main/useEmployerInterface'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/main/useEmployerCreate'

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
const { coreProfile, appProfile, activeProfile } = useEmployerComputed(profile)
const { pillProps, cellProps, profileProps } = useEmployerInterface(profile)
const { createEmployer } = useEmployerCreate()

const currentEmployer = activeProfile
const currentEmployerPill = computed(() =>
  currentEmployer.value ? pillProps(currentEmployer.value) : null
)
const currentEmployerCell = computed(() =>
  currentEmployer.value ? cellProps(currentEmployer.value) : null
)
const currentEmployerProfileCard = computed(() =>
  currentEmployer.value ? profileProps(currentEmployer.value) : null
)

const employerRecord = computed<Employer | null>(() => {
  const active = currentEmployer.value
  if (!active) return null
  const displayName =
    active.display_name ??
    active.title ??
    active.organization_name ??
    'Employer'
  return {
    id: active.id,
    display_name: displayName,
    avatar: active.avatar ?? active.avatar_url ?? undefined,
    core: coreProfile.value,
    app: appProfile.value,
  }
})

const hero = computed(() => {
  const cell = currentEmployerCell.value
  if (!cell) return null
  const pill = currentEmployerPill.value
  return {
    pillComponent: pill ? 'JobProfilesEmployerCardsPill' : undefined,
    pillProps: pill ? { employer: pill } : null,
    pillClass: null,
    cellComponent: 'OrganismsProfilesEmployerCardsCell',
    cellProps: { employer: cell },
  }
})

const creating = createEmployer.state
const onEnsure = async () => {
  await createEmployer()
}
</script>

<style scoped>
.empty-state {
  display: grid;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  text-align: center;
  justify-items: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--ui-text-300, rgba(148, 163, 184, 0.9));
}

.empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-copy {
  margin: 0;
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
  max-width: 26rem;
}
</style>
