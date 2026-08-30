<template>
  <main class="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10">
    <AppHero description="Browse every App across the FireUX platform." />
    <AppCurrent :apps="appsController.apps.value" />
    <AppCreate :apps="appsController.apps.value" />
    <AppCollection
      :apps="appsController.apps.value"
      title="Platform Apps"
      description="All Apps from their canonical ecosystem collections."
    />
  </main>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'
import { isDirectoryAppIndexable } from '../../utils/directorySearchPolicy'

const appsController = useApps('/api/platform/apps')

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
  description: 'Browse all FireUX Apps.',
  layout: 'default',
  name: 'FireuxAppsIndexPage',
})

useSeo({
  title: 'FireUX Apps',
  description:
    'Browse Apps across the FireUX platform, including direct Project Apps and Ecosystem Apps.',
  path: '/apps',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: appsController.apps.value
        .filter((app) => isDirectoryAppIndexable(app.id))
        .map((app) => ({
          name: app.name,
          url: context.absoluteUrl(app.detail_url),
        })),
    }),
})
</script>
