<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/employers/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Employers"
      description="Inspect your employer profile and browse all employers resolved for this runtime."
    />

    <UPageBody class="space-y-6">
      <OrganismsProfilesEmployerSectionsSingle
        :core-profile="coreProfile"
        :app-profile="appProfile"
        :pill="pill"
      />

      <OrganismsProfilesEmployerSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'

definePageMeta({
  nav: {
    key: 'employers',
    label: 'Employers',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Employers',
  description: 'Employer profiles resolved for this runtime.',
  layout: 'default',
  name: 'EmployersIndexPage',
})

const { coreProfile, appProfile, pill } = useEmployer()

useHead({ title: 'Employers' })
</script>
