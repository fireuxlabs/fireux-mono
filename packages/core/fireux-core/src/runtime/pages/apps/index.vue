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
