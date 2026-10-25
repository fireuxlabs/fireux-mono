<template>
  <UPage>
    <EcosystemHero />
    <UPageBody>
      <FireState v-bind="page.state" />
      <EcosystemCollection
        v-if="page.state.outcome === 'ready'"
        :ecosystems="page.ecosystems"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useEcosystemCollectionPage } from '../../composables/useEcosystemCollectionPage'

definePageMeta({
  tag: 'ecosystems',
  nav: {
    key: 'ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Ecosystems',
  description: 'Browse published FireUX Ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

const page = useEcosystemCollectionPage()
</script>
