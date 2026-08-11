<template>
  <section class="collection-directory kitchen-directory">
    <CollectionDirectoryHeader
      :title="title"
      :description="description"
      compact
    >
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="collection-directory__search"
        />

        <UButton
          v-if="showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="
            variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'
          "
          :aria-label="
            variant === 'pill'
              ? 'Switch to card view'
              : 'Switch to compact view'
          "
          @click="toggleVariant"
        />

        <span v-if="showCount && isSettled" class="collection-directory__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <CollectionDirectoryState
      v-if="outcome === 'pending'"
      title="Loading kitchens"
      loading
      icon="i-lucide-loader-circle"
      description="Finding kitchens…"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Kitchens unavailable"
      description="Kitchens could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <template #actions>
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="refreshCollection"
        />
      </template>
    </CollectionDirectoryState>

    <div v-else-if="cardsFiltered.length" class="kitchen-directory__results">
      <KitchenCollectionList
        :cards="cardsFiltered"
        :variant="variant"
      >
        <template #pill="{ card }">
          <KitchenCardsPill
            v-bind="card"
            :link="linkEnabled"
            :show-badges="showBadges"
          />
        </template>
        <template #cell="{ card }">
          <KitchenCardsCell
            v-bind="card"
            :link="linkEnabled"
            :show-badges="showBadges"
            directory
          />
        </template>
      </KitchenCollectionList>

      <UAlert
        v-if="loadMoreError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="More kitchens could not be loaded"
        description="The kitchens already shown are still available."
      />

      <div v-if="hasMore" class="kitchen-directory__more">
        <UButton
          label="Load more kitchens"
          color="neutral"
          variant="soft"
          :loading="loadingMore"
          @click="loadMore"
        />
      </div>
    </div>

    <div v-else>
      <CollectionDirectoryState
        icon="i-lucide-utensils"
        :title="query ? 'No matching kitchens' : 'No kitchens yet'"
        :description="query
          ? 'Try a different kitchen name or location.'
          : 'Kitchens will appear here when they are added.'"
      />

      <div v-if="hasMore && !query" class="kitchen-directory__more">
        <UButton
          label="Check more kitchens"
          color="neutral"
          variant="soft"
          :loading="loadingMore"
          @click="loadMore"
        />
      </div>
    </div>

    <div>
      <DevJson
        :title="devJsonTitle"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: consume the bounded public Kitchen/Place projection without page-local search false negatives.
// Concurrent edit — 2026-07-22 15:12 CEST — Kitchen directory preview: distinguish authorized all-Kitchen results from the public directory.
// Concurrent edit — 2026-07-24 17:12 CEST — Collection canon: consume the projection through useKitchenCollection.
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import {
  computed,
} from 'vue'
import { useKitchenCollection } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

type KitchenCollectionItem = KitchenSurface

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
    showBadges?: boolean
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Kitchen collection',
    description: '',
    searchPlaceholder: 'Search kitchens…',
    showSearch: true,
    showVariantToggle: false,
    showCount: true,
    initialVariant: 'cell',
    link: true,
    showBadges: false,
    devJsonTitle: 'Kitchens (JSON)',
    devJsonContext: 'collection manager · kitchens · collection surface',
  }
)

const fetched = useKitchenCollection()
const collectionSurface = computed<KitchenCollectionItem[]>(
  () => fetched.kitchens.value ?? []
)
const outcome = computed(() => fetched.outcome.value)
const hasMore = computed(() => fetched.hasMore.value)
const loadingMore = computed(() => fetched.loadingMore.value)
const loadMoreError = computed(() => fetched.loadMoreError.value)
const loadMore = async () => {
  await fetched.loadMore()
}
const refreshCollection = async () => {
  await fetched.refresh()
}
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(collectionSurface)
const title = computed(() => String(props.title || 'Kitchen collection'))
const description = computed(() =>
  String(
    props.description || 'Choose a Kitchen to view its profile and menus.'
  ).trim()
)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search kitchens…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showBadges = computed(() =>
  props.showBadges !== false || fetched.canViewHidden.value
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Kitchens (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · kitchens · collection surface'
  ).trim()
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useKitchenInterface()

const collection = computed<KitchenCollectionItem[]>(() =>
  collectionSurface.value
    .filter((row): row is KitchenCollectionItem => Boolean(makeCard(row)))
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    KitchenCollectionItem,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (kitchen: KitchenCollectionItem) => makeCard(kitchen),
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard,
  makePill,
  makeCell,
})

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && !hasMore.value && totalCount.value > 15
)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} kitchens`
    : `${totalCount.value} kitchen${totalCount.value === 1 ? '' : 's'}`
)
</script>

<style scoped>
.kitchen-directory__results {
  display: grid;
  gap: calc(var(--spacing) * 6);
}

.kitchen-directory__more {
  display: flex;
  justify-content: center;
}
</style>
