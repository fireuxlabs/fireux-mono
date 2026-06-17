<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <AgentCTA />
      <AgentCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'agents',
  nav: {
    visibility: { profiles: ['agent'] },
    key: 'agents',
    label: 'Agents',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Agents',
  description: 'Browse agent profiles.',
  layout: 'default',
  name: 'AgentsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Agents'
const pageDescription =
  'View your profile and browse agents.'

useHead({ title: `${appName} | ${pageTitle}` })

</script>
