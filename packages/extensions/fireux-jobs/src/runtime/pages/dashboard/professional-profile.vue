packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional-profile.vue
<template>
  <DashboardEditStructure
    title="Professional Profile"
    description="Manage how employers see your professional presence."
    :hero="hero"
    :dev-data="professionalRecord"
  >
    <UPageCard
      v-if="currentProfessionalProfileCard && professionalRecord"
      variant="subtle"
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <JobProfilesProfessionalCardsPill
              v-if="currentProfessionalPill"
              :professional="currentProfessionalPill"
            />
            <OrganismsProfilesProfessionalCardsCell
              v-if="currentProfessionalCell"
              :professional="currentProfessionalCell"
            />
          </div>

          <JobProfilesProfessionalCardsProfile
            :professional="currentProfessionalProfileCard"
          />
        </div>

        <JobProfilesProfessionalEdit :professional="professionalRecord" />
      </div>
    </UPageCard>

    <UCard v-else>
      <div class="empty-state">
        <UIcon name="i-lucide-user-round-cog" class="empty-icon" />
        <h3 class="empty-title">Your professional profile is missing</h3>
        <p class="empty-copy">
          Create your professional presence to showcase experience and skills.
        </p>
        <UButton color="primary" :loading="creating" @click="onEnsure">
          Create Professional Profile
        </UButton>
      </div>
    </UCard>
  </DashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import type { ProfessionalCoreProfile } from '../../models/profiles/Professional.model'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional'
import { useProfessionalComputed } from '../../composables/firestore/profiles/Professional/main/useProfessionalComputed'
import { useProfessionalInterface } from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/main/useProfessionalCreate'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: 'Professional Profile',
    icon: 'i-lucide-user-round-cog',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})

const { profile } = useProfessional()
const { coreProfile, activeProfile } = useProfessionalComputed(profile)
const { pillProps, cellProps, profileProps } = useProfessionalInterface(profile)
const { createProfessional } = useProfessionalCreate()

const currentProfessional = activeProfile
const currentProfessionalPill = computed(() =>
  currentProfessional.value ? pillProps(currentProfessional.value) : null
)
const currentProfessionalCell = computed(() =>
  currentProfessional.value ? cellProps(currentProfessional.value) : null
)
const currentProfessionalProfileCard = computed(() =>
  currentProfessional.value ? profileProps(currentProfessional.value) : null
)

const professionalRecord = computed<ProfessionalCoreProfile | null>(
  () => coreProfile.value
)

const hero = computed(() => {
  const cell = currentProfessionalCell.value
  if (!cell) return null
  const pill = currentProfessionalPill.value
  return {
    pillComponent: pill ? 'JobProfilesProfessionalCardsPill' : undefined,
    pillProps: pill ? { professional: pill } : null,
    pillClass: null,
    cellComponent: 'OrganismsProfilesProfessionalCardsCell',
    cellProps: { professional: cell },
  }
})

const creating = createProfessional.state
const onEnsure = async () => {
  await createProfessional()
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
