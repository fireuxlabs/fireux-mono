<!-- Concurrent edit — 2026-07-21 14:38 CEST — Business public projection: expose explicit bounded directory pagination. -->
<template>
  <section class="entity-collection business-collection">
    <FireCollectionHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="entity-collection__search"
        />

        <UButton
          v-if="showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'"
          :aria-label="
            variant === 'pill'
              ? 'Switch to card view'
              : 'Switch to compact view'
          "
          @click="toggleVariant"
        />

        <span
          v-if="showCount && outcome !== 'pending' && outcome !== 'error'"
          class="entity-collection__count"
        >
          {{ countLabel }}
        </span>
      </template>
    </FireCollectionHeader>

    <FireStateCard
      surface="collection"
      v-if="outcome === 'pending'"
      title="Loading businesses"
      description="Finding businesses…"
      icon="i-lucide-loader-circle"
      loading
    />

    <FireStateCard
      surface="collection"
      v-else-if="outcome === 'error'"
      title="Businesses unavailable"
      description="Businesses could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      state="error"
    >
      <template #actions>
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="fetched.refresh"
        />
      </template>
    </FireStateCard>

    <div v-else-if="cardsFiltered.length">
      <BusinessCollectionList :cards="cardsFiltered" :variant="variant">
        <template #pill="{ card }">
          <BusinessCardsPill v-bind="card" :link="linkEnabled" />
        </template>
        <template #cell="{ card }">
          <BusinessCardsCell v-bind="card" :link="linkEnabled" />
        </template>
      </BusinessCollectionList>

      <UAlert
        v-if="loadMoreError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="More businesses could not be loaded"
        description="The businesses already shown are still available."
      />

      <div v-if="hasMore">
        <UButton
          label="Load more businesses"
          variant="soft"
          color="neutral"
          :loading="loadingMore"
          :disabled="loadingMore"
          @click="handleLoadMore"
        />
      </div>
    </div>

    <FireStateCard
      surface="collection"
      v-else
      icon="i-lucide-building-2"
      :title="query ? 'No businesses match your search' : 'No businesses yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once business records are added, they will display here.'
      "
    />

    <div>
      <FireDiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="'Businesses (JSON)'"
        context="Business collection · canonical Businesses with explicitly linked Places"
        :objects="devJsonData"
        :derived="{ places: collection }"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDiagnosticsCollectionJson } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import type { Business } from '../../../models/business.model'
import { useBusinessCollection } from '../../../composables/useBusinessCollection'
import { useBusinessInterface } from '../../../composables/business/useBusinessInterface'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Businesses',
    description: 'Browse businesses and their business profiles.',
    link: true,
    searchPlaceholder: 'Search businesses…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useBusinessCollection()
const businesses = computed(() => fetched.businesses.value)
const collection = computed<Business[]>(() => fetched.businesses.value)
const outcome = computed(() => fetched.outcome.value)
const hasMore = computed(() => fetched.hasMore.value)
const loadingMore = computed(() => fetched.loadingMore.value)
const loadMoreError = computed(() => fetched.loadMoreError.value)
async function handleLoadMore(): Promise<void> {
  await fetched.loadMore()
}
const { devJsonData, loadDevJson, unloadDevJson } =
  useDiagnosticsCollectionJson(businesses)
const title = computed(() => String(props.title || 'Businesses'))
const description = computed(() =>
  String(props.description || 'Browse businesses and their business profiles.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search businesses…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useBusinessInterface()

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Business, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (place: Business) => makeCard(place),
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard,
  makePill,
  makeCell,
})

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
