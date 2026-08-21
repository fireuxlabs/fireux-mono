<template>
  <section class="collection-directory chef-directory">
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

        <span v-if="showCount && isSettled" class="collection-directory__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <CollectionDirectoryState
      v-if="outcome === 'pending'"
      title="Loading chefs"
      description="Finding chef profiles…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Chefs unavailable"
      description="Chef profiles could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    />

    <ChefCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ChefCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <ChefCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </ChefCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-chef-hat"
      :title="query ? 'No matching chefs' : 'No chefs yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Chef profiles will appear here once they are available.'
      "
    />

    <div>
      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="'Chefs (JSON)'"
        context="collection manager · chefs"
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
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: render root Chef rows with canonical User joins.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: consume the exact Chef directory projection without storage-model casts.
import { computed } from 'vue'
import { useChefFetch } from '../../../composables/firestore/profiles/Chef/fetch/useChefFetch'
import { useChefInterface } from '../../../composables/chef/useChefInterface'
import type { ChefDirectoryProfile } from '../../../models/chef.model.ts'

type ChefEntry = ChefDirectoryProfile

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
    title: 'Chefs',
    description: 'Choose a chef to discover their craft and experience.',
    link: true,
    searchPlaceholder: 'Search chefs…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
  }
)

const fetched = useChefFetch()
const { outcome } = fetched
const collection = fetched.coreChefs
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Chefs'))
const description = computed(() =>
  String(
    props.description || 'Choose a chef to discover their craft and experience.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search chefs…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const isSettled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeChefCard,
  pill: makeChefPill,
  cell: makeChefCell,
} = useChefInterface()
const makeCard = (entry: ChefEntry) =>
  makeChefCard(entry, fetched.userById(entry.id))
const makePill = (entry: ChefEntry) =>
  makeChefPill(entry, fetched.userById(entry.id))
const makeCell = (entry: ChefEntry) =>
  makeChefCell(entry, fetched.userById(entry.id))
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<ChefEntry, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard,
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
    ? `${visibleCount.value} of ${totalCount.value} chefs`
    : `${totalCount.value} chef${totalCount.value === 1 ? '' : 's'}`
)
</script>
