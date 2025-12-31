<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesProfessionalCTA />
      <OrganismsProfilesProfessionalCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  description: 'Professional profiles resolved for this runtime.',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

const pageTitle = 'Professionals'
const pageDescription =
  'Inspect your professional profile and browse all professionals available to this runtime.'

useHead({ title: pageTitle })
</script>
