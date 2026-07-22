<template>
  <PublicIndexSurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-handshake"
    secondary-label="For agents"
  >
    <AgentCollectionManager />

    <template #secondary>
      <!-- Profile CTA family: Agent is a profile layer attached to a User. -->
      <AgentCTA />
    </template>
  </PublicIndexSurface>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

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
  description:
    'Meet agents connecting people, opportunities, and teams across the network.',
  layout: 'default',
  name: 'AgentsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Agents'
const pageDescription =
  'Meet agents connecting people, opportunities, and teams across the network.'

useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/agents',
})
</script>
