<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Ecosystems"
      description="Platform ecosystem index for the current FireUX workspace."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Ecosystems index"
        description="Browse FireUX ecosystem identity records and move into the Project console when you need the management facade."
        family="project"
        source="system ecosystem identity"
        :count-label="`${count} ecosystem${count === 1 ? '' : 's'}`"
        :actions="actions"
      />

      <EcosystemCollectionManager :collection="ecosystems" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection'

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
  description:
    'Entity index for FireUX ecosystems stored as system-level product and app groupings.',
})

const { ecosystems, count } = useEcosystemCollection()

const actions = [
  {
    label: 'Project',
    cta: 'Open Project Console',
    to: '/console/project',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Manage',
    cta: 'Manage ecosystems',
    to: '/console/project/ecosystem',
    icon: 'i-lucide-orbit',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/ecosystems/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
