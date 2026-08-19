<template>
  <section class="collection-directory app-directory">
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
      title="Loading Apps"
      description="Finding Apps…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Apps unavailable"
      description="Apps could not be loaded. Please try again."
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

    <AppCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <AppCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <AppCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </AppCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-app-window"
      :title="query ? 'No apps match your search' : 'No apps yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once app records are added, they will display here.'
      "
    />

    <div>
      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="'Apps (JSON)'"
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
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useDevCollectionJson } from '../../../composables/dev/useDevCollectionJson'
import { computed } from 'vue'
import {
  useAppInterface,
  type AppViewSource,
} from '../../composables/useAppInterface'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from '../../../composables/shared/useCollectionVariantCards'
import type { AppDirectoryController } from '../../../types/directory-controller.types.ts'

const props = withDefaults(
  defineProps<{
    controller: AppDirectoryController
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
    title: 'Apps',
    description: 'Browse canonical app records for the current ecosystem.',
    link: true,
    searchPlaceholder: 'Search apps…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed<AppViewSource[]>(() => props.controller.apps.value)
const outcome = computed(() => props.controller.outcome.value)
const refresh = () => props.controller.refresh?.()
const isSettled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Apps'))
const description = computed(() =>
  String(
    props.description ||
      'Browse canonical app records for the current ecosystem.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search apps…')
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
} = useAppInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<AppViewSource, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (app) => makeCard(app),
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
const devJsonContext = computed(
  () => `collection manager · apps · source: ${props.controller.source}`
)
</script>
