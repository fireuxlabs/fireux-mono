<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Current Professional -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Professional</h1>
        </template>

        <template v-if="professional?.user?.avatar && professional?.user?.display_name">
          <MoleculesPill
            :avatar="professional.user.avatar"
            initials="A"
            :title="professional.user.display_name"
            :subtitle="professional.title"
            :badges="professional.specialties"
            :to="`/professionals/${professional.id}`"
          />
          <DevJsonPanel :data="professional" />
        </template>
        <MoleculesNotFound v-else kind="document" entity="professional" />
      </UCard>

      <!-- Current Employer -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Employer</h1>
        </template>

        <template v-if="employer?.user?.avatar && employer?.user?.display_name">
          <MoleculesPill
            :avatar="employer.user.avatar"
            initials="A"
            :title="employer.user.display_name"
            :subtitle="employer.title"
            :badges="employer.specialties"
            :to="`/employers/${employer.id}`"
          />
          <DevJsonPanel :data="employer" />
        </template>
        <MoleculesNotFound v-else kind="document" entity="employer" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void

import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile'
import { professionalConfig } from '../../models/profiles/Professional.model'
import { employerConfig } from '../../models/profiles/Employer.model'

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

const { profile: professional } = useProfile(professionalConfig)
const { profile: employer } = useProfile(employerConfig)

</script>