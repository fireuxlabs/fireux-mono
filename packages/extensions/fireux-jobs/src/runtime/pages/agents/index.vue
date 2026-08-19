<template>
  <DirectorySurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-handshake"
    secondary-label="For hiring teams"
  >
    <AgentCollectionManager />

    <template #secondary>
      <!-- Profile CTA family: Agent is a profile layer attached to a User. -->
      <AgentCTA />
    </template>
  </DirectorySurface>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  tag: 'agents',
  nav: {
    visibility: { profiles: ['agent'] },
    key: 'agents',
    label: 'Hiring profiles',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Hiring profiles',
  description:
    'Meet the hiring teams posting opportunities across the network.',
  layout: 'default',
  name: 'AgentsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Hiring profiles'
const pageDescription =
  'Meet the hiring teams posting opportunities across the network.'

useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/agents',
})
</script>
