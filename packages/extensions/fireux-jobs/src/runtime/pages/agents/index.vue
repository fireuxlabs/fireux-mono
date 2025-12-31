<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsProfilesAgentCTA />
      <OrganismsProfilesAgentCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'

definePageMeta({
  nav: {
    key: 'agents',
    label: 'Agents',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Agents',
  description: 'Agent profiles resolved for this runtime.',
  layout: 'default',
  name: 'AgentsIndexPage',
})

const pageTitle = 'Agents'
const pageDescription =
  'Inspect your agent profile and browse all agents resolved for this runtime.'

useHead({ title: pageTitle })
</script>
