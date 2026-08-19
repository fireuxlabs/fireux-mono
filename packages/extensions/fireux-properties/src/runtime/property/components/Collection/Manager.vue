<template>
  <section class="collection-directory property-directory">
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
      title="Loading properties"
      description="Finding properties…"
      icon="i-lucide-loader-circle"
      loading
      role="status"
      aria-live="polite"
      aria-busy="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Properties unavailable"
      description="Properties could not be loaded. Please try again."
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

    <div v-else-if="cardsFiltered.length" class="grid gap-4">
      <PropertyCollectionList :cards="cardsFiltered" :variant="variant">
        <template #pill="{ card }">
          <PropertyCardsPill
            v-bind="card"
            :link="false"
            :show-meta="true"
            :show-badges="showBadges"
          />
        </template>
        <template #cell="{ card }">
          <PropertyCardsCell v-bind="card" :link="false" :show-meta="true" />
        </template>
      </PropertyCollectionList>

      <UAlert
        v-if="loadMoreError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="More properties could not be loaded"
        description="The properties already shown are still available."
      />

      <div v-if="hasMore" class="flex justify-center">
        <UButton
          label="Load more properties"
          color="neutral"
          variant="soft"
          :loading="loadingMore"
          :disabled="loadingMore"
          @click="loadMore"
        />
      </div>
    </div>

    <div v-else class="grid gap-4">
      <CollectionDirectoryState
        icon="i-lucide-house"
        :title="query ? 'No matching properties' : 'No properties yet'"
        :description="
          query
            ? 'Try a different property name.'
            : 'Published properties will appear here when they are available.'
        "
      />

      <UButton
        v-if="hasMore && !query"
        label="Check more properties"
        color="neutral"
        variant="soft"
        :loading="loadingMore"
        @click="loadMore"
      />

      <UAlert
        v-if="loadMoreError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="More properties could not be loaded"
        description="More properties could not be loaded. Please try again."
      />
    </div>

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
// Concurrent edit — 2026-07-20 23:02 CEST — Property public projection: keep bounded browse cards unlinked until public detail exists.
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import { usePublicPropertyIndex } from '../../composables/usePublicPropertyIndex'
import type { PublicPropertyIndexItem } from '../../models/property-index.model.ts'
import PropertyCardsCell from '../Cards/Cell.vue'
import PropertyCardsPill from '../Cards/Pill.vue'
import PropertyCollectionList from './List.vue'

type PublicPropertyCard = {
  id: string
  to: string
  title: string
  subtitle: string
  meta: string
  imageUrl: string
  status: string
  badges: string[]
  summary: string
}

const propertyTypeLabel = (value: PublicPropertyIndexItem['property_type']) =>
  value.charAt(0).toUpperCase() + value.slice(1)

const makeCard = (property: PublicPropertyIndexItem): PublicPropertyCard => {
  const typeLabel = propertyTypeLabel(property.property_type)
  const unitLabel = `${property.unit_count} unit${property.unit_count === 1 ? '' : 's'}`

  return {
    id: property.id,
    to: '',
    title: property.name,
    subtitle: typeLabel,
    meta: unitLabel,
    imageUrl: property.image_url || '',
    status: 'active',
    badges: [typeLabel],
    summary: '',
  }
}

const makePill = makeCard
const makeCell = makeCard

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    showBadges?: boolean
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Properties',
    description: 'Browse properties available through this app.',
    searchPlaceholder: 'Search properties...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    showBadges: true,
    devJsonTitle: 'Properties (JSON)',
    devJsonContext: 'collection manager · properties',
  }
)

const fetched = usePublicPropertyIndex()
const collection = computed(() => fetched.properties.value)
const outcome = computed(() => fetched.outcome.value)
const hasMore = computed(() => fetched.hasMore.value)
const loadingMore = computed(() => fetched.loadingMore.value)
const loadMoreError = computed(() => fetched.loadMoreError.value)
const loadMore = async () => {
  await fetched.loadMore()
}
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Properties'))
const description = computed(() => String(props.description || '').trim())
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search properties...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showBadges = computed(() => props.showBadges !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && !hasMore.value && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<PublicPropertyIndexItem, PublicPropertyCard>({
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
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Properties (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(props.devJsonContext || 'collection manager · properties').trim()
)
</script>
