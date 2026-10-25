<template>
  <UContainer>
    <UPage>
      <UPageHeader :title="page.title" :description="page.description" />
      <UPageBody>
        <FireState v-bind="page.state" />
        <AppCollection
          v-if="page.ready"
          :apps="page.apps"
          :has-more="page.pagination?.hasMore ?? false"
        />
        <FireCollectionPagination
          v-if="page.pagination"
          v-bind="page.pagination"
          @load-more="page.loadMore"
        />
        <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
      </UPageBody>
    </UPage>
  </UContainer>
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
