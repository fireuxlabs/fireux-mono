<template>
  <section class="collection-directory ecosystem-directory">
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
      title="Loading Ecosystems"
      description="Finding Ecosystems…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Ecosystems unavailable"
      description="Ecosystems could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="refresh"
        />
      </template>
    </CollectionDirectoryState>

    <EcosystemCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <EcosystemCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <EcosystemCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </EcosystemCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-orbit"
      :title="query ? 'No ecosystems match your search' : 'No ecosystems yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once ecosystem records are added, they will display here.'
      "
    />

    <div>
      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Ecosystems (JSON)"
        context="collection manager · ecosystems · directory projection"
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
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useDevCollectionJson } from '../../../composables/dev/useDevCollectionJson'
import { computed } from 'vue'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from '../../../composables/shared/useCollectionVariantCards'
import {
  useEcosystemInterface,
  type EcosystemInterfaceInput,
} from '../../composables/useEcosystemInterface'
import type { EcosystemDirectoryController } from '../../../types/directory-controller.types.ts'

const props = withDefaults(
  defineProps<{
    controller: EcosystemDirectoryController
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
    title: 'Ecosystems',
    description: 'Browse ecosystems available in this workspace.',
    link: false,
    searchPlaceholder: 'Search ecosystems…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
  }
)

const rawCollection = computed<EcosystemInterfaceInput[]>(() =>
  props.controller.ecosystems.value.map((entry) => ({
    ...entry,
    href: entry.detail_url,
    appCount: entry.app_count,
  }))
)
const outcome = computed(() => props.controller.outcome.value)
const refresh = () => props.controller.refresh?.()
const isSettled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Ecosystems'))
const description = computed(() => String(props.description || '').trim())
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search ecosystems…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useEcosystemInterface()

const collection = computed<EcosystemInterfaceInput[]>(() =>
  rawCollection.value.filter((row): row is EcosystemInterfaceInput =>
    Boolean(makeCard(row))
  )
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    EcosystemInterfaceInput,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (row) => makeCard(row),
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
  () => showSearch.value && totalCount.value > 15
)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
