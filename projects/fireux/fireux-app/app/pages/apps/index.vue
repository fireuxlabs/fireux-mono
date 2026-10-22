<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Showcase"
        description="Explore the public App directory and see what each product offers."
      />
      <UPageBody>
        <MoleculesStateCard
          v-if="outcome === 'pending'"
          entity="apps"
          kind="collection"
          loading
        />
        <MoleculesStateCard
          v-else-if="outcome === 'error'"
          entity="apps"
          kind="collection"
          state="error"
        />
        <MoleculesStateCard
          v-else-if="outcome === 'empty'"
          entity="apps"
          kind="collection"
          state="empty"
        />
        <AppCollection v-else :apps="apps" />
        <MoleculesCopyError v-if="error" :message="String(error)" />
        <MoleculesCopyError
          v-if="loadMoreError"
          :message="String(loadMoreError)"
        />
        <UButton v-if="hasMore" :loading="loadingMore" @click="loadMore"
          >Load more Apps</UButton
        >
        <DiagnosticsDebugPanel
          title="Apps index acquisition"
          context="Platform Apps passed into the FL index surface."
          object-origin="fetched"
          :objects="{ apps }"
          :derived="{ count: apps.length, scope: 'platform' }"
          include-route
          launcher
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useAppCollection } from 'fireux-core/runtime/app/composables/useAppCollection'
import { isDirectoryAppIndexable } from '../../utils/directorySearchPolicy'

const { apps, outcome, error, hasMore, loadingMore, loadMoreError, loadMore } =
  useAppCollection('/api/platform/apps?limit=24')

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
  layout: 'framework',
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
      items: apps.value
        .filter((app) => isDirectoryAppIndexable(app.id))
        .map((app) => ({
          name: app.name,
          url: context.absoluteUrl(`/apps/${encodeURIComponent(app.id)}`),
        })),
    }),
})
</script>
