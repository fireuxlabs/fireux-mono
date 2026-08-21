<template>
  <section class="collection-directory driver-directory">
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
      title="Loading drivers"
      description="Finding driver profiles…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Drivers unavailable"
      description="Driver profiles could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    />

    <DriverCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <DriverCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <DriverCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </DriverCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-truck"
      :title="query ? 'No matching drivers' : 'No drivers yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Driver profiles will appear here once they are available.'
      "
    />

    <DevDebugPanel
      object-origin="fetched"
      launcher
      include-route
      title="Drivers (JSON)"
      context="collection manager · drivers"
      :objects="devJsonData"
      :derived="{}"
      :default-open="false"
      @opened="loadDevJson"
      @closed="unloadDevJson"
    />
  </section>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: adapt profile entries to shared card mechanics.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: render Driver rows with canonical User joins.
import { computed } from 'vue'
import { useDriverFetch } from '../../../composables/firestore/profiles/Driver/fetch/useDriverFetch'
import { useDriverInterface } from '../../../composables/driver/useDriverInterface'
import type { DriverDirectoryProfile } from '../../../models/driver.model.ts'

type DriverEntry = DriverDirectoryProfile

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
    title: 'Drivers',
    description: 'Choose a driver to explore their delivery profile.',
    link: true,
    searchPlaceholder: 'Search drivers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
  }
)

const fetched = useDriverFetch()
const { outcome } = fetched
const collection = computed<DriverEntry[]>(() => fetched.drivers.value)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Drivers'))
const description = computed(() =>
  String(
    props.description || 'Choose a driver to explore their delivery profile.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search drivers…')
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
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useDriverInterface()
const makeEntryCard = (entry: DriverEntry) =>
  makeCard(entry, fetched.userById(entry.id))
const makeEntryPill = (entry: DriverEntry) =>
  makePill(entry, fetched.userById(entry.id))
const makeEntryCell = (entry: DriverEntry) =>
  makeCell(entry, fetched.userById(entry.id))
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<DriverEntry, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: makeEntryCard,
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard: makeEntryCard,
  makePill: makeEntryPill,
  makeCell: makeEntryCell,
  cellMode: 'replace',
})

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} drivers`
    : `${totalCount.value} driver${totalCount.value === 1 ? '' : 's'}`
)
</script>
