<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <UFieldGroup
              v-if="showFilters"
              size="xs"
            >
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
              size="xs"
              :placeholder="searchPlaceholder"
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
            <UBadge v-if="showCount" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <PlaceCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <PlaceCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <PlaceCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </PlaceCollectionList>

    <p v-else>
      {{ query ? 'No places match your search.' : 'No places found.' }}
    </p>

    <div>
      <DevJson
        :title="'Places (JSON)'"
        context="collection manager · places"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
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
    title: 'Places',
    description: 'Browse place records available to this runtime.',
    link: true,
    searchPlaceholder: 'Search places…',
    showSearch: true,
    showFilterToggle: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = usePlaceCollection()
const collection = computed(() => fetched.collection.value)
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Places'))
const description = computed(() =>
  String(props.description || 'Browse place records available to this runtime.')
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

const { query, variant, toggleVariant, visibleItems } =
  useCollectionSearch<BasePlace, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (place: BasePlace) => makeCard(place),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .filter((place) => matchesEntityFamilyFilter(place))
    .map((place) => {
      if (variant.value === 'cell') {
        const base = makeCard(place)
        const cell = makeCell(place)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(place)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

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
    if (nextFilters.some((filter: { id: string }) => filter.id === activeEntityFamily.value)) return
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
