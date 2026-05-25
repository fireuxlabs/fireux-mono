<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="FireUX apps"
      description="Browse published app records in the FireUX ecosystem."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Published app directory"
        description="Apps are public identity records for products, standalone tools, and ecosystem surfaces."
        family="console"
        source="apps/{appId}"
        :count-label="`${publishedCount} app${publishedCount === 1 ? '' : 's'}`"
        :actions="actions"
      />

      <AppCollectionManager
        v-if="featuredApps.length"
        :collection="featuredApps"
        title="Featured apps"
        description="Selected app records for FireUX."
        :show-search="false"
        :show-variant-toggle="false"
        initial-variant="cell"
      />

      <AppCollectionManager
        :collection="publishedApps"
        title="All apps"
        description="Browse the full published app collection."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppPublicSettings } from 'fireux-core/runtime/composables/fireux/app/useAppPublicSettings'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import type { AppModel } from 'fireux-core/runtime/models/core/app.model'

definePageMeta({
  tag: 'apps',
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Apps',
  description: 'Browse published FireUX apps.',
  layout: 'default',
  name: 'FireuxAppsIndexPage',
})

useSeoMeta({
  title: 'FireUX Apps',
  description:
    'Browse published app records in the FireUX ecosystem, including standalone apps and ecosystem surfaces.',
})

const { apps } = useAppCollection()
const { featuredAppSlugs } = useAppPublicSettings()

const clean = (value: unknown) => String(value ?? '').trim()

const publishedApps = computed(() =>
  (apps.value ?? [])
    .filter((entry) => clean(entry.status) === 'active')
    .filter((entry) => clean(entry.id) && clean(entry.slug))
    .sort((a, b) => clean(a.app_name).localeCompare(clean(b.app_name)))
)
const publishedCount = computed(() => publishedApps.value.length)
const featuredApps = computed(() => {
  const bySlug = new Map(
    publishedApps.value.map((entry) => [clean(entry.slug), entry])
  )

  return featuredAppSlugs.value
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is AppModel => Boolean(entry))
})

const actions = [
  {
    label: 'Pricing',
    cta: 'Launch an app',
    to: '/pricing/apps',
    icon: 'i-lucide-badge-dollar-sign',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/apps/learn-more',
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
