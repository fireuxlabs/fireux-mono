<template>
  <UPage>
    <UPageBody>
      <header class="mb-6 space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
          Explore apps
        </h1>
        <p class="text-muted">Find an app and see what it offers.</p>
      </header>
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
      <AppCollection v-else :apps="apps" :has-more="hasMore" />
      <MoleculesCopyError v-if="error" :message="String(error)" />
      <MoleculesCopyError
        v-if="loadMoreError"
        :message="String(loadMoreError)"
      />
      <UButton v-if="hasMore" :loading="loadingMore" @click="loadMore"
        >Load more Apps</UButton
      >
      <DevDebugPanel
        title="Apps index acquisition"
        context="Canonical Apps passed into the FL index surface."
        object-origin="fetched"
        :objects="{ apps }"
        :derived="{ count: apps.length, scope: 'ecosystem' }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAppCollection } from '../../app/composables/useAppCollection'
import { useSeo } from '../../composables/fireux/seo/useSeo'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  appRole: 'global',
  title: 'Apps',
  description: 'Browse apps for the current ecosystem.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { appName } = useFireUXConfig()
const { apps, outcome, error, hasMore, loadingMore, loadMoreError, loadMore } =
  useAppCollection('/api/apps?limit=24')

const pageTitle = 'Apps'
const pageDescription = 'Find an app and see what it offers.'

useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/apps',
})
</script>
