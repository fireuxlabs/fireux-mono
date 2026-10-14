<template>
  <UPage>
    <UPageBody class="space-y-6">
      <MenuDirectoryHeader>
        <MenuDirectoryActions />
      </MenuDirectoryHeader>
      <MenuDirectoryResults :menus="menus" />
      <CollectionPagination
        :has-more="hasMore"
        :loading="loadingMore"
        @load-more="loadMore"
      />
      <DiagnosticsDebugPanel
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
const {
  collection: menus,
  hasMore,
  loadingMore,
  loadMore,
} = useMenuDirectory()
useSeo({
  title: `${appName} | Menus`,
  description: 'Browse live kitchen menus.',
  path: '/menus',
})
</script>
