<template>
  <UPage>
    <MenuCollectionHeader />
    <UPageBody>
      <FireState v-bind="page.state" retryable @retry="page.refresh()" />
      <MenuCollectionResults
        :hide-results="
          (page.pending && !page.pagination?.loading) || page.unavailable
        "
        :menus="page.menus"
        @service-change="page.service = $event"
        @search-change="page.search = $event"
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
import { useMenuCollectionPage } from '../../menu/composables/useMenuCollectionPage'

definePageMeta({
  tag: 'menus',
  name: 'MenusIndexPage',
  title: 'Menus',
  description: 'Browse live menus.',
  layout: 'default',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
})

const page = useMenuCollectionPage()
</script>
