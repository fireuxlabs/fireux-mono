<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Ecosystems"
      description="Platform ecosystem index for the current FireUX project."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Ecosystems index"
        description="Browse ecosystem records from the FireUX project and move into the project console when you need to manage them."
        family="project"
        source="db.collections.ecosystem"
        :count-label="`${count} ecosystem${count === 1 ? '' : 's'}`"
        :actions="actions"
      />

      <EcosystemCollectionManager :collection="ecosystems" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/ecosystem/fetch/useEcosystemCollection'

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
    'Entity index for FireUX ecosystems stored in db.collections.ecosystem.',
})

const { ecosystems, count } = useEcosystemCollection()

const actions = [
  {
    label: 'Project',
    cta: 'Open Project Console',
    to: '/console/projects',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Manage',
    cta: 'Manage ecosystems',
    to: '/console/projects/ecosystem',
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
