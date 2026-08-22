<template>
  <section class="collection-directory supplier-directory">
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
      title="Loading suppliers"
      description="Finding suppliers…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Suppliers unavailable"
      description="Suppliers could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
    />

    <SupplierCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <SupplierCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
      <template #cell="{ card }">
        <SupplierCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
    </SupplierCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-truck"
      :title="query ? 'No matching suppliers' : 'No suppliers yet'"
      :description="
        query
          ? 'Try a different supplier name.'
          : 'Suppliers will appear here when they are available.'
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
        :derived="{ companies: fetched.companies.value, places: fetched.places.value }"
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
import type { Supplier } from '../../models/Supplier.model.ts'
import { useSupplierCollection } from '../../composables/firestore/useSupplier'
import { useSupplierInterface } from '../../composables/firestore/utils/view/useSupplierInterface'

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
    title: 'Suppliers',
    description:
      'Find suppliers and explore their identities, catalogues and delivery areas.',
    link: true,
    showBadges: true,
    searchPlaceholder: 'Search suppliers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    devJsonTitle: 'Suppliers (JSON)',
    devJsonContext:
      'Supplier collection · canonical Suppliers with Companies and Places',
  }
)

const fetched = useSupplierCollection()
const rawCollection = computed(() => fetched.suppliers.value)
const canonicalSuppliers = computed(() => fetched.roots.value)
const outcome = computed(() => fetched.outcome.value)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(canonicalSuppliers)
const title = computed(() => String(props.title || 'Suppliers'))
const description = computed(() =>
  String(
    props.description ||
      'Find suppliers and explore their identities, catalogues and delivery areas.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search suppliers…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Suppliers (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext ||
      'Supplier collection · canonical Suppliers with Companies and Places'
  ).trim()
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useSupplierInterface()

const collection = computed<Supplier[]>(() =>
  rawCollection.value.filter((entry): entry is Supplier =>
    Boolean(makeCard(entry as Supplier))
  )
)
const totalCount = computed(() => collection.value.length)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Supplier, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (entry) => makeCard(entry),
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
