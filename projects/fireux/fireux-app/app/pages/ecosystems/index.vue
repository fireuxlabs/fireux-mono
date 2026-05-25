<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="FireUX ecosystems"
      description="Explore the public ecosystem layer built on FireUX."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Published ecosystem directory"
        description="Each ecosystem has its own identity, main app, products, pricing, and tenant-app path."
        family="console"
        source="ecosystems/{ecosystemId}"
        :count-label="`${publishedCount} ecosystem${publishedCount === 1 ? '' : 's'}`"
        :actions="actions"
      />

      <EcosystemMain
        :collection="publishedEcosystems"
        :featured-slugs="featuredEcosystemSlugs"
      />

      <EcosystemCollectionManager
        :collection="publishedEcosystems"
        title="All ecosystems"
        description="Browse the full published ecosystem collection."
        link
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EcosystemMain from 'fireux-core/runtime/components/Ecosystem/Main.vue'
import { useAppPublicSettings } from 'fireux-core/runtime/composables/fireux/app/useAppPublicSettings'
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection'

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

const { ecosystems } = useEcosystemCollection()
const { featuredEcosystemSlugs } = useAppPublicSettings()

const clean = (value: unknown) => String(value ?? '').trim()

const publishedEcosystems = computed(() =>
  ecosystems.value
    .filter((entry) => clean(entry.status) === 'active')
    .filter((entry) => clean(entry.id) && clean(entry.slug))
    .sort((a, b) => clean(a.name).localeCompare(clean(b.name)))
)
const publishedCount = computed(() => publishedEcosystems.value.length)

const actions = [
  {
    label: 'Pricing',
    cta: 'Create an ecosystem',
    to: '/ecosystems/pricing',
    icon: 'i-lucide-badge-dollar-sign',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/ecosystems/learn-more',
    icon: 'i-lucide-book-open',
  },
  {
    label: 'Project',
    cta: 'Project Console',
    to: '/console/project',
    icon: 'i-lucide-layout-dashboard',
  },
] as const
</script>
