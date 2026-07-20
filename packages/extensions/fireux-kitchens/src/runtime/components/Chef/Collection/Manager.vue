<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <div class="ml-auto flex items-center gap-2">
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

            <UBadge v-if="showSettledCount" variant="soft">{{
              countLabel
            }}</UBadge>
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="chefs"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="chefs"
      state="error"
      surface="bare"
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

    <MoleculesStateCard
      v-else
      state="empty"
      surface="bare"
      :title="query ? 'No chefs match your search.' : 'No chefs found.'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Chef profiles will appear here once they are available.'
      "
    />

    <div>
      <DevJson
        :title="'Chefs (JSON)'"
        context="collection manager · chefs"
        :data="devJsonData"
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
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: render root Chef rows with canonical User joins.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: consume the exact Chef directory projection without storage-model casts.
import { computed } from 'vue'
import { useChefFetch } from '../../../composables/fireux/firestore/profiles/Chef/fetch/useChefFetch'
import { useChefInterface } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import type { PublicChefDirectoryProfile } from '../../../models/chef.model'

type ChefEntry = PublicChefDirectoryProfile

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
    description: 'Browse chefs available to this runtime.',
    link: true,
    searchPlaceholder: 'Search chefs…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useChefFetch()
const { outcome } = fetched
const collection = fetched.coreChefs
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Chefs'))
const description = computed(() =>
  String(props.description || 'Browse chefs available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search chefs…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showSettledCount = computed(
  () =>
    showCount.value && (outcome.value === 'ready' || outcome.value === 'empty')
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
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
