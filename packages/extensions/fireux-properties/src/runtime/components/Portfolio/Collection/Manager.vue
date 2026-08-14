<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls"
        >
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <UInput
              v-if="showSearchInput"
              v-model="query"
              size="xs"
              :placeholder="searchPlaceholder"
              :aria-label="searchPlaceholder"
            />

            <UButton
              v-if="showVariantToggle"
              size="xs"
              variant="ghost"
              :icon="
                variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'
              "
              :aria-label="
                variant === 'pill'
                  ? 'Switch to list view'
                  : 'Switch to grid view'
              "
              @click="toggleVariant"
            />

            <UBadge v-if="showCount && isSettled" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="portfolios"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="portfolios"
      state="error"
      surface="bare"
      description="Portfolios could not be loaded. Please try again."
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

    <MoleculesStateCard
      v-else
      entity="portfolios"
      state="empty"
      surface="bare"
      :title="query ? 'No matching portfolios' : 'No portfolios yet'"
      :description="query
        ? 'Try a different portfolio name.'
        : 'Portfolios will appear here when they are available.'"
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
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/usePortfolio'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../models/portfolio.model'
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
    description: 'Browse portfolios available in this workspace.',
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
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(rawCollection)
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
  rawCollection.value
    .filter((portfolio): portfolio is Portfolio => Boolean(makeCard(portfolio)))
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
