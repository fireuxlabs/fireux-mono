<template>
  <UPage>
    <UPageHeader
      title="Ecosystems"
      description="Explore published Ecosystem projections across the FireUX platform."
    />

    <UPageBody>
      <EcosystemCTA />

      <EcosystemCollectionManager
        :controller="ecosystemsController"
        description="Published Ecosystem projections from their owning databases."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const ecosystemsController = usePlatformEcosystemDirectory()

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
  description: 'Explore active FireUX ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

useSeoMeta({
  title: 'FireUX Ecosystems',
  description:
    'Browse published FireUX ecosystems including Misebox, Cleanbox, Bringli, Granite, and the FireUX platform ecosystem.',
})

</script>
