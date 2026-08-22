<template>
  <section class="collection-directory professional-directory">
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
      title="Loading professionals"
      description="Finding professional profiles…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Professionals unavailable"
      description="Professional profiles could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    />

    <ProfessionalCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ProfessionalCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <ProfessionalCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </ProfessionalCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-briefcase-business"
      :title="query ? 'No matching professionals' : 'No professionals yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Professional profiles will appear here once they are available.'
      "
    />

    <div>
<DevDebugPanel
  object-origin="fetched"
        launcher
        include-route
        :title="'Professionals (JSON)'"
        context="collection manager · professionals"
        :objects="{ profiles: devJsonData, users: profileUsers }"
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
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: consume the exact Professional directory projection without storage-model casts.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import { useProfessionalFetch } from '../../../composables/fireux/firestore/profiles/Professional/fetch/useProfessionalFetch'
import { useProfessionalInterface } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalDirectoryProfile } from '../../../models/profiles/Professional/Professional.model'
import ProfessionalCardsCell from '../Cards/Cell.vue'
import ProfessionalCardsPill from '../Cards/Pill.vue'
import ProfessionalCollectionList from './List.vue'

type ProfessionalEntry = ProfessionalDirectoryProfile

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
    title: 'Professionals',
    description: 'Choose a professional to explore their experience and work.',
    link: true,
    searchPlaceholder: 'Search professionals…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
  }
)

const fetched = useProfessionalFetch()
const { outcome, profileUsers } = fetched
const collection = fetched.coreProfessionals
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Professionals'))
const description = computed(() =>
  String(
    props.description ||
      'Choose a professional to explore their experience and work.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search professionals…')
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
} = useProfessionalInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    ProfessionalEntry,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (entry) => makeCard(entry, fetched.userById(entry.id)),
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard: (entry) => makeCard(entry, fetched.userById(entry.id)),
  makePill: (entry) => makePill(entry, fetched.userById(entry.id)),
  makeCell: (entry) => makeCell(entry, fetched.userById(entry.id)),
})

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} professionals`
    : `${totalCount.value} professional${totalCount.value === 1 ? '' : 's'}`
)
</script>
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover:
render root Professional rows with canonical User joins.
