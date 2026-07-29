<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update ecosystem discovery copy. -->
<template>
  <UPage>
    <UPageHeader
      title="Ecosystems"
      description="Browse published Ecosystems and see which Apps each one groups."
    />

    <UPageBody>
      <EcosystemCollectionManager
        :controller="ecosystemsController"
        description="Published Ecosystems and their App relationships."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePublishedPlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const ecosystemsController = usePublishedPlatformEcosystemDirectory()

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
  description: 'Browse published FireUX ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

useSeoMeta({
  title: 'FireUX Ecosystems',
  description: 'Browse published FireUX ecosystems and their connected Apps.',
})

</script>
