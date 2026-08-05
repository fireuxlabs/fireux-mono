<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Browse published apps across the FireUX platform."
    />

    <UPageBody>
      <!-- Core/platform CTA family: AppCTA starts onboarding; My apps is scoped, browse is the public collection. -->
      <AppCTA :controller="appsController" />
      <AppCollectionMine :controller="appsController" />

      <AppCollectionManager
        :controller="appsController"
        title="Platform directory"
        description="Published App projections from their owning Projects and Ecosystems."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePlatformAppDirectory } from '../../composables/usePlatformDirectory'
import { isDirectoryAppIndexable } from '../../utils/directorySearchPolicy'

const appsController = usePlatformAppDirectory()

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

useSeo({
  title: 'FireUX Apps',
  description:
    'Browse published apps across the FireUX platform, including direct Project Apps and Ecosystem Apps.',
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
          name: app.app_name,
          url: context.absoluteUrl(app.detail_url),
        })),
    }),
})
</script>
