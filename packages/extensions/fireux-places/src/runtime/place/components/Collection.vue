<template>
  <section class="entity-collection place-collection">
    <CollectionHeader :title="title" :description="description" compact>
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
          class="entity-collection__search"
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

        <span v-if="showCount" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionHeader>

    <div v-if="cardsFiltered.length" class="place-collection__results">
      <PlaceCollectionList :cards="cardsFiltered" :variant="variant">
        <template #pill="{ card }">
          <PlaceCardsPill v-bind="card" :link="linkEnabled" />
        </template>
        <template #cell="{ card }">
          <PlaceCardsCell v-bind="card" :link="linkEnabled" directory />
        </template>
      </PlaceCollectionList>

      <div v-if="hasMore" class="place-collection__more">
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
  </section>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed, ref, watch } from 'vue'
import { usePlaceInterface } from '../composables/firestore/usePlace'
import type { BasePlace } from '../composables/firestore/fetch/search/types'

const props = withDefaults(
  defineProps<{
    places: BasePlace[]
    hasMore?: boolean
    loadingMore?: boolean
    loadMore?: () => Promise<boolean>
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

const collection = computed(() => props.places)
async function handleLoadMore(): Promise<void> {
  await props.loadMore?.()
}
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
      label: formatWorkspaceFamilyLabel(id),
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
  return place.entity_families
}

function matchesEntityFamilyFilter(place: BasePlace) {
  if (activeEntityFamily.value === 'all') return true

  const families = placeEntityFamilies(place)

  return families.includes(activeEntityFamily.value)
}

function formatWorkspaceFamilyLabel(value: string) {
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
.place-collection__results {
  display: grid;
  gap: calc(var(--spacing) * 6);
}

.place-collection__more {
  display: flex;
  justify-content: center;
}
</style>
