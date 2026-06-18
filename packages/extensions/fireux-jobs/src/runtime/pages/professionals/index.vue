<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <!-- Profile CTA family: Professional is a profile layer attached to a User. -->
      <ProfessionalCTA />
      <ProfessionalCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'professionals',
  nav: {
    visibility: { profiles: ['professional'] },
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 62,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  description: 'Browse professional profiles.',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Professionals'
const pageDescription =
  'Find professionals, or create your profile.'

useHead({ title: `${appName} | ${pageTitle}` })
</script>
