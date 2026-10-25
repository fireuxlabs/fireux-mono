<template>
  <UPage>
    <UPageBody class="space-y-6">
      <MenuCollectionHeader />
      <FireStateCard v-if="pending && !loadingMore" surface="collection" title="Loading menus" loading />
      <FireStateCard v-else-if="error" surface="collection" title="Menus unavailable" description="Menus could not be loaded. Please try again." state="error">
        <template #actions><UButton label="Try again" @click="refresh()" /></template>
      </FireStateCard>
      <MenuCollectionResults :hide-results="(pending && !loadingMore) || Boolean(error)" :menus="menus" @service-change="service = $event" @search-change="search = $event" />
      <UAlert v-if="loadMoreError && !error" title="More menus could not be loaded" description="Try loading more again." color="error" />
      <FireCollectionPagination
        :has-more="hasMore && !error"
        :loading="loadingMore"
        @load-more="loadMore"
      />
      <FireDiagnosticsDebugPanel
        title="Menus index acquisition"
        context="Canonical Menu directory records and pagination inputs used by the FL index surface."
        object-origin="fetched"
        :objects="{ menus }"
        :derived="{ count: menus.length, hasMore, loadingMore }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useMenuDirectory } from '../../menu/composables/useMenuDirectory'

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
const { appName } = useFireUXConfig()
const search = ref('')
const service = ref<'online' | 'collection' | 'delivery'>('online')
const {
  pending, error, refresh, loadMoreError,
  collection: menus,
  hasMore,
  loadingMore,
  loadMore,
} = useMenuDirectory({ service, search })
useSeo({
  title: `${appName} | Menus`,
  description: 'Browse live kitchen menus.',
  path: '/menus',
})
</script>
