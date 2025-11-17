<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/employers/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Employers"
      description="Inspect your employer profile and browse all employers resolved for this runtime."
    />
    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfilesEmployerSectionsSingle
          :core-profile="coreProfile"
          :app-profile="appProfile"
          :pill="pill"
        />
      </template>

      <UPageCTA
        v-else
        title="Create your employer profile"
        description="Add an employer profile to your FireUX portfolio so talent knows who is hiring."
        variant="naked"
        :links="employerCtaLinks"
      />

      <OrganismsProfilesEmployerSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
const employerCtaLinks = [
  {
    label: 'Get started',
    color: 'neutral',
    to: '/dashboard/employer-profile',
  },
  {
    label: 'Learn more',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-arrow-right',
    to: '/employers/learn-more',
  },
]
const hasProfile = computed(() => Boolean(coreProfile.value))

useHead({ title: 'Employers' })
</script>
