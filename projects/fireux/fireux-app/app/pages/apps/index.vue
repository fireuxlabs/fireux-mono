<template>
  <FirePage
    :title="page.title"
    :description="page.description"
    :state="page.state"
    :pagination="page.pagination"
    :diagnostics="page.diagnostics"
    @load-more="page.loadMore"
  >
    <AppCollection
      v-if="page.ready"
      :apps="page.apps"
      :has-more="page.pagination.hasMore"
    />
  </FirePage>
</template>

<script setup lang="ts">
import { usePlatformAppsPage } from '../../composables/usePlatformAppsPage'

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

const page = usePlatformAppsPage()
</script>
