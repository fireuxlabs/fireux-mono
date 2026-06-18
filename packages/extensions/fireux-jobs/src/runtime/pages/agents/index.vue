<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <!-- Profile CTA family: Agent is a profile layer attached to a User. -->
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
  'Find agents, or create your profile.'

useHead({ title: `${appName} | ${pageTitle}` })

</script>
