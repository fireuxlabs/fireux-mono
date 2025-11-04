<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Current Professional -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Professional</h1>
        </template>

        <template
          v-if="
            professional &&
            professional.user?.avatar &&
            professional.user.display_name
          "
        >
          <MoleculesPill
            :avatar="professional.user.avatar"
            initials="A"
            :title="professional.user.display_name"
            :subtitle="professional.subtitle"
            :badges="professional.badges"
            :to="`/professionals/${professional.id}`"
          />
        </template>
        <MoleculesNotFound v-else kind="document" entity="professional" />

        <template #footer>
          <DevJsonPanel v-if="professional" :data="professional" />
        </template>
      </UCard>

      <!-- Current Employer -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Employer</h1>
        </template>

        <template
          v-if="employer && employer.user?.avatar && employer.user.display_name"
        >
          <MoleculesPill
            :avatar="employer.user.avatar"
            initials="A"
            :title="employer.user.display_name"
            :subtitle="employer.subtitle"
            :badges="employer.badges"
            :to="`/employers/${employer.id}`"
          />
        </template>
        <MoleculesNotFound v-else kind="document" entity="employer" />

        <template #footer>
          <DevJsonPanel v-if="employer" :data="employer" />
        </template>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void

import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../models/profiles/Professional.model'
import {
  employerConfig,
  type EmployerProfile,
} from '../../models/profiles/Employer.model'

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

const { profile: professional } =
  useProfile<ProfessionalProfile>(professionalConfig)
const { profile: employer } = useProfile<EmployerProfile>(employerConfig)
</script>
