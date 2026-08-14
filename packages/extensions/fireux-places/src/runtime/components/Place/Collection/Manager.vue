<!-- Concurrent edit — 2026-07-21 14:38 CEST — Place public projection: expose explicit bounded directory pagination. -->
<template>
  <section class="collection-directory place-directory">
    <CollectionDirectoryHeader
      :title="title"
      :description="description"
      compact
    >
      <template #controls>
        <UFieldGroup v-if="showFilters" size="sm">
          <UButton
            color="neutral"
            :variant="activeEntityFamily === 'all' ? 'solid' : 'ghost'"
            @click="setActiveEntityFamily('all')"
          >
            All
          </UButton>
          <UButton
            v-for="family in entityFamilyFilters"
            :key="family.id"
            color="neutral"
            :variant="activeEntityFamily === family.id ? 'solid' : 'ghost'"
            @click="setActiveEntityFamily(family.id)"
          >
            {{ filterButtonLabel(family.label, family.count) }}
          </UButton>
        </UFieldGroup>

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
      title="Loading places"
      description="Finding places…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Places unavailable"
      description="Places could not be loaded. Please try again."
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
          @click="fetched.refresh"
        />
      </template>
    </CollectionDirectoryState>

    <div v-else-if="cardsFiltered.length" class="place-directory__results">
      <PlaceCollectionList :cards="cardsFiltered" :variant="variant">
        <template #pill="{ card }">
          <PlaceCardsPill v-bind="card" :link="linkEnabled" />
        </template>
        <template #cell="{ card }">
          <PlaceCardsCell v-bind="card" :link="linkEnabled" directory />
        </template>
      </PlaceCollectionList>

      <UAlert
        v-if="loadMoreError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="More places could not be loaded"
        description="The places already shown are still available."
      />

      <div v-if="hasMore" class="place-directory__more">
        <UButton
          label="Load more places"
          variant="soft"
          color="neutral"
          :loading="loadingMore"
          :disabled="loadingMore"
          @click="handleLoadMore"
        />
      </div>
    </div>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-map-pin"
      :title="
        query || activeEntityFamily !== 'all'
          ? 'No places match your filters'
          : 'No places yet'
      "
      :description="
        query || activeEntityFamily !== 'all'
          ? 'Try changing the search or entity-family filter.'
          : 'Published places will appear here when they are ready.'
      "
    />

    <div>
<DevDebugPanel
  object-origin="fetched"
        launcher
        include-route
        :title="'Places (JSON)'"
        context="collection manager · places"
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
import { computed, ref, watch } from 'vue'
import {
  usePlaceCollection,
  usePlaceInterface,
} from '../../../composables/fireux/firestore/place/usePlace'
import type { BasePlace } from '../../../models/place.model'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showFilterToggle?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Place directory',
    description:
      'Explore venues and the physical places behind local services.',
    link: true,
    searchPlaceholder: 'Search places…',
    showSearch: true,
    showFilterToggle: true,
    showVariantToggle: false,
    showCount: true,
    initialVariant: 'cell',
  }
)

const fetched = usePlaceCollection()
const collection = computed(() => fetched.collection.value)
const outcome = computed(() => fetched.outcome.value)
const hasMore = computed(() => fetched.hasMore.value)
const loadingMore = computed(() => fetched.loadingMore.value)
const loadMoreError = computed(() => fetched.loadMoreError.value)
async function handleLoadMore(): Promise<void> {
  await fetched.loadMore()
}
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Place directory'))
const description = computed(() =>
  String(
    props.description ||
      'Explore venues and the physical places behind local services.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search places…')
)
const showSearch = computed(() => props.showSearch !== false)
const showFilterToggle = computed(() => props.showFilterToggle !== false)
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
} = usePlaceInterface()
const activeEntityFamily = ref('all')
const entityFamilyFilters = computed(() => {
  const counts = new Map<string, number>()

  for (const place of collection.value) {
    for (const family of placeEntityFamilies(place)) {
      counts.set(family, (counts.get(family) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([id, count]) => ({
      id,
      label: formatConsoleFamilyLabel(id),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})
const showFilters = computed(
  () => showFilterToggle.value && entityFamilyFilters.value.length > 0
)

const { query, variant, toggleVariant, visibleItems } = useCollectionSearch<
  BasePlace,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (place: BasePlace) => makeCard(place),
  initialVariant: props.initialVariant,
})

const filteredVisibleItems = computed(() =>
  visibleItems.value.filter((place) => matchesEntityFamilyFilter(place))
)
const { cards: cardsFiltered } = useCollectionVariantCards({
  items: filteredVisibleItems,
  variant,
  makeCard,
  makePill,
  makeCell,
})

const countLabel = computed(() =>
  (showSearchInput.value && query.value) || activeEntityFamily.value !== 'all'
    ? `${cardsFiltered.value.length} / ${totalCount.value}`
    : `${totalCount.value}`
)

function placeEntityFamilies(place: BasePlace) {
  return Array.isArray((place as any)?.entity_families)
    ? (place as any).entity_families
        .map((entry: unknown) => String(entry || '').trim())
        .filter(Boolean)
    : []
}

function matchesEntityFamilyFilter(place: BasePlace) {
  if (activeEntityFamily.value === 'all') return true

  const families = placeEntityFamilies(place)

  return families.includes(activeEntityFamily.value)
}

function formatConsoleFamilyLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

watch(
  entityFamilyFilters,
  (nextFilters: Array<{ id: string }>) => {
    if (activeEntityFamily.value === 'all') return
    if (
      nextFilters.some(
        (filter: { id: string }) => filter.id === activeEntityFamily.value
      )
    )
      return
    activeEntityFamily.value = 'all'
  },
  { immediate: true }
)

const filterButtonLabel = (label: string, count?: number) => {
  const suffix = typeof count === 'number' ? ` (${count})` : ''
  return `${label}${suffix}`
}

function setActiveEntityFamily(family: string) {
  activeEntityFamily.value = String(family || 'all').trim() || 'all'
}
</script>

<style scoped>
.place-directory__results {
  display: grid;
  gap: calc(var(--spacing) * 6);
}

.place-directory__more {
  display: flex;
  justify-content: center;
}
</style>
