<template>
  <div class="menu-customer-page">
    <header class="menu-customer-header">
      <UContainer class="menu-customer-header__inner">
        <NuxtLink to="/menus" aria-label="Browse menus"
          ><AppBrandWordmark size="large"
        /></NuxtLink>
        <h1>Food &amp; drinks</h1>
      </UContainer>
    </header>
    <main>
      <UContainer class="menu-customer-content">
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
        <DevDebugPanel
          title="Menus index acquisition"
          context="Canonical Menu directory records and pagination inputs used by the FL index surface."
          object-origin="fetched"
          :objects="{ menus }"
          :derived="{ count: menus.length, hasMore, loadingMore }"
          include-route
          launcher
        />
      </UContainer>
    </main>
  </div>
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
  layout: false,
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

<style scoped>
.menu-customer-header {
  border-bottom: 1px solid var(--ui-border);
}
.menu-customer-header__inner {
  min-height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.menu-customer-header__inner h1 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ui-text-muted);
}
.menu-customer-content {
  padding-top: 1rem;
  padding-bottom: 2rem;
}
</style>
