<template>
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
</template>

<script setup lang="ts">
import { useAppCollectionPage } from '../../app/composables/useAppCollectionPage'

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

const page = useAppCollectionPage({ scope: 'ecosystem' })
</script>
