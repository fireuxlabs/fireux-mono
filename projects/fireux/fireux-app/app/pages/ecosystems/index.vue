<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Ecosystems"
      description="Browse active FireUX ecosystems and jump to their live surfaces."
    />

    <UPageBody class="pagebody">
      <EcosystemCTA />

      <UAlert
        v-if="errors.length"
        color="warning"
        variant="soft"
        title="Some ecosystem sources are unavailable"
        :description="`Directory errors: ${errors.length}`"
      />

      <EcosystemCollectionManager
        :collection="collection"
        :pending="appsPending"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({
  tag: 'ecosystems',
  nav: {
    key: 'ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Ecosystems',
  description: 'Explore active FireUX ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

useSeoMeta({
  title: 'Ecosystems · FireUX',
  description: 'Directory of active FireUX ecosystems and their global app surfaces.',
})

const { appsPending, errors, displayedEcosystems } = useLandingDirectory()
const collection = computed(() => displayedEcosystems.value ?? [])
</script>
