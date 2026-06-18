<template>
  <UPage>
    <UPageHeader
      title="FireUX ecosystems"
      description="Explore the public ecosystem layer built on FireUX."
    />

    <UPageBody>
      <EcosystemCTA />

      <EcosystemCollectionManager
        title="Ecosystems"
        description="Browse the full published ecosystem collection."
        link
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
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
