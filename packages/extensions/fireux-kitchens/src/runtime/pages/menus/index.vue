<template>
  <UPage>
    <UPageBody class="!mt-0 !space-y-8">
      <MenuHero />
      <MenuCollection
        :menus="menus"
        :pending="pending"
        :unavailable="Boolean(error)"
        :has-more="hasMore"
        @retry="refresh()"
      />
      <CollectionPagination
        :has-more="hasMore"
        :loading="loadingMore"
        @load-more="loadMore"
      />
      <p v-if="loadMoreError" role="alert" class="text-sm text-muted">
        More menus couldn’t load. Please try again.
      </p>
      <MoleculesCopyError
        v-if="loadMoreError"
        message="More menus couldn’t load. Please try again."
      />
      <MenuCreate />
      <DevDebugPanel
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
  description: 'Find food, drinks and menus from local venues.',
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
  pending,
  error,
  refresh,
  loadMoreError,
  hasMore,
  loadingMore,
  loadMore,
} = useMenuDirectory()
useSeo({
  title: `${appName} | Menus`,
  description:
    'Explore local menus. Find food, drinks, delivery and collection options.',
  path: '/menus',
})
</script>
