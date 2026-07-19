<template>
  <section class="collection-directory menu-directory">
    <CollectionDirectoryHeader
      :title="props.title"
      :description="props.description"
    >
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="props.searchPlaceholder"
          aria-label="Search menus"
          class="collection-directory__search"
          icon="i-lucide-search"
        />

        <UButton
          v-if="props.showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="variantIcon"
          :aria-label="`Switch to ${nextVariantLabel} view`"
          :title="`Switch to ${nextVariantLabel} view`"
          @click="toggleVariant"
        />

        <span
          v-if="props.showCount && isSettled"
          class="collection-directory__count"
        >
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <MenuCollectionPicks v-model="selectedPicks" />

    <CollectionDirectoryState
      v-if="isLoading"
      title="Loading menus"
      description="Fetching the latest published menus…"
      icon="i-lucide-loader-2"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome.kind === 'unavailable'"
      title="Menus unavailable"
      description="Published menus could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    />

    <div
      v-else-if="visibleItems.length"
      class="menu-directory__entries"
      :class="`menu-directory__entries--${variant}`"
    >
      <template v-for="menu in visibleItems" :key="menu.id">
        <MenuCardsPreview
          v-if="variant === 'preview'"
          :menu="menu"
          :route-scope="rootMenuRouteScope()"
        />

        <MenuCardsCell
          v-else-if="variant === 'cell'"
          :menu="menu"
          :route-scope="rootMenuRouteScope()"
        />

        <MenuCardsPill
          v-else
          :menu="menu"
          :route-scope="rootMenuRouteScope()"
        />
      </template>
    </div>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-book-open-check"
      :title="hasActiveFilters ? 'No matching menus' : 'No menus yet'"
      :description="hasActiveFilters
        ? 'Try a different menu or kitchen name.'
        : 'Published menus will appear here when they are ready.'"
    />

    <div
      v-if="outcome.kind === 'list' && index.hasMore.value"
      class="menu-directory__more"
    >
      <UButton
        type="button"
        variant="soft"
        data-menu-action="load-more"
        :loading="index.loadingMore.value"
        @click="loadMore"
      >
        Load more menus
      </UButton>
    </div>

    <p
      v-if="outcome.kind === 'list' && index.loadMoreError.value"
      class="text-sm text-error"
      role="alert"
    >
      More menus could not be loaded. Please try again.
    </p>

    <DevJson
      title="Menus (JSON)"
      context="collection manager · menus"
      :objects="devObjects"
      :derived="devDerived"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import {
  useMenuInterface,
} from '../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'
import type { PublicMenuIndexController } from '../../../composables/fireux/menu/usePublicMenuIndex'
import type { PublicMenuIndexItem } from '../../../models/kitchen/menu/menu-index.model'
import { useKitchenServiceNow } from '../../../composables/fireux/kitchen/useKitchenServiceNow'
import {
  menuMatchesCollectionPicks,
  type MenuCollectionPick,
} from '../../../utils/menu-collection-picks'
import { rootMenuRouteScope } from '../../../utils/kitchen-menu-route'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell' | 'preview'
    index: PublicMenuIndexController
  }>(),
  {
    title: 'Live menus',
    description: 'Open a live menu and browse its published dishes.',
    searchPlaceholder: 'Search menus...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'preview',
  }
)

const { interface: makeMenuCard } = useMenuInterface()
const collection = computed<PublicMenuIndexItem[]>(() => props.index.menus.value)
const outcome = computed(() => props.index.outcome.value)
const isLoading = computed(() =>
  outcome.value.kind === 'loading' || outcome.value.kind === 'redirect'
)
const isSettled = computed(() =>
  outcome.value.kind === 'list' || outcome.value.kind === 'empty'
)
const selectedPicks = ref<MenuCollectionPick[]>([])
const { now: serviceNow } = useKitchenServiceNow()
const pickedCollection = computed<PublicMenuIndexItem[]>(() =>
  collection.value.filter((menu: PublicMenuIndexItem) =>
    menuMatchesCollectionPicks(menu, selectedPicks.value, serviceNow.value)
  )
)
const { devJsonData } = useDevCollectionJson(collection)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => props.showSearch && !props.index.hasMore.value && totalCount.value > 15
)

const makeCard = (menu: PublicMenuIndexItem) => makeMenuCard({
  ...menu,
  image_url:
    menu.kitchen?.logo_image_url ||
    menu.kitchen?.image_url,
  image_shade: menu.kitchen?.image_shade,
})

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    PublicMenuIndexItem,
    NonNullable<ReturnType<typeof makeMenuCard>>,
    'preview' | 'cell' | 'pill'
  >({
    items: pickedCollection,
    makeCard: (menu) => makeCard(menu),
    initialVariant: props.initialVariant,
    variants: ['preview', 'cell', 'pill'],
  })

const variantIcon = computed(() => {
  if (variant.value === 'preview') return 'i-lucide-panels-top-left'
  if (variant.value === 'cell') return 'i-lucide-list'
  return 'i-lucide-layout-grid'
})
const nextVariantLabel = computed(() => {
  if (variant.value === 'preview') return 'cell'
  if (variant.value === 'cell') return 'pill'
  return 'preview'
})
const hasActiveFilters = computed(() =>
  Boolean(query.value.trim() || selectedPicks.value.length)
)

const countLabel = computed(() =>
  hasActiveFilters.value
    ? `${visibleCount.value} of ${totalCount.value} menus`
    : `${totalCount.value}${props.index.hasMore.value ? '+' : ''} menu${totalCount.value === 1 ? '' : 's'}`
)
const loadMore = async () => {
  await props.index.loadMore()
}

const guestSurfaces = (contexts: PublicMenuIndexItem['contexts'] = []) => [
  'browse',
  ...contexts,
]
const devObjects = computed(() => ({
  menus: devJsonData.value.map((menu, index) => ({
    ...menu,
    guest_surfaces: guestSurfaces(collection.value[index]?.contexts),
  })),
}))
const devDerived = computed(() => ({
  family: 'Root Simple Collection Manager',
  source: {
    rootPath: 'menus',
    hydration:
      'One bounded server batch per page resolves current Kitchen identity, effective service hours, and referenced KitchenMenu guest-ordering contexts. Detail resolves content and theme.',
  },
  controls: {
    query: query.value,
    picks: selectedPicks.value,
    variant: variant.value,
    showSearchInput: showSearchInput.value,
    hasMore: props.index.hasMore.value,
  },
  counts: {
    total: totalCount.value,
    visible: visibleCount.value,
  },
  cards: visibleItems.value.map((menu) => ({
    id: menu.id,
    guestSurfaces: guestSurfaces(menu.contexts),
    contexts: menu.contexts,
    title: menu.name,
    subtitle: menu.source?.kitchen_name,
    description: menu.description,
  })),
}))
</script>

<style scoped>
.menu-directory__more {
  display: flex;
  justify-content: center;
}

.menu-directory__entries {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.menu-directory__entries--pill {
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, calc(var(--spacing) * 80)), 1fr)
  );
}

</style>
