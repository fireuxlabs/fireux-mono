<template>
  <section class="collection-directory portfolio-directory">
    <CollectionDirectoryHeader :title="title" :description="description">
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
          class="collection-directory__count"
        >
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <CollectionDirectoryState
      v-if="outcome === 'pending'"
      title="Loading portfolios"
      description="Finding portfolios…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Portfolios unavailable"
      description="Portfolios could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
    />

    <PortfolioCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <PortfolioCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
      <template #cell="{ card }">
        <PortfolioCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
    </PortfolioCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-building-2"
      :title="query ? 'No matching portfolios' : 'No portfolios yet'"
      :description="
        query
          ? 'Try a different portfolio name.'
          : 'Portfolios will appear here when they are available.'
      "
    />

    <div>
      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="devJsonTitle"
        :context="devJsonContext"
        :objects="devJsonData"
        :derived="{}"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import { usePortfolioCollection } from '../../composables/firestore/usePortfolio'
import { usePortfolioInterface } from '../../composables/firestore/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../models/portfolio.model.ts'
import PortfolioCardsCell from '../Cards/Cell.vue'
import PortfolioCardsPill from '../Cards/Pill.vue'
import PortfolioCollectionList from './List.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    link?: boolean
    showBadges?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Available Portfolios',
    description: 'Browse property portfolios available through this app.',
    link: true,
    showBadges: true,
    searchPlaceholder: 'Search portfolios…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    devJsonTitle: 'Portfolios (JSON)',
    devJsonContext: 'collection manager · portfolios · raw collection',
  }
)

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = usePortfolioInterface()
const fetched = usePortfolioCollection()
const rawCollection = computed(() => fetched.portfolios.value)
const outcome = computed(() => fetched.outcome.value)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Available Portfolios'))
const description = computed(() => String(props.description || '').trim())
const linkEnabled = computed(() => props.link !== false)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search portfolios…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const collection = computed<Portfolio[]>(() =>
  rawCollection.value.filter((portfolio): portfolio is Portfolio =>
    Boolean(makeCard(portfolio))
  )
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Portfolios (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · portfolios · raw collection'
  ).trim()
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Portfolio, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (portfolio) => makeCard(portfolio),
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
