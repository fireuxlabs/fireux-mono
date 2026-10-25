<template>
  <section class="entity-collection ingredient-collection">
    <FireCollectionHeader :title="title" :description="description">
      <template #controls>
        <div class="flex w-full flex-wrap items-center justify-end gap-2">
          <USelect
            v-model="category"
            size="xs"
            :items="categoryOptions"
            aria-label="Filter Ingredient category"
            class="min-w-36 shrink-0"
          />
          <UInput
            v-if="showSearchInput"
            v-model="query"
            size="xs"
            :placeholder="searchPlaceholder"
            :aria-label="searchPlaceholder"
            class="min-w-36 shrink-0"
          />
          <UButton
            v-if="showVariantToggle"
            size="xs"
            variant="ghost"
            :icon="
              variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'
            "
            :aria-label="
              variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'
            "
            @click="toggleVariant"
          />
          <span v-if="showCount" class="entity-collection__count">
            {{ countLabel }}
          </span>
        </div>
      </template>
    </FireCollectionHeader>

    <IngredientImageBatch :ingredients="collection" />

    <IngredientCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <IngredientCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-subtitle="false"
          :show-badges="false"
        />
      </template>
      <template #cell="{ card }">
        <IngredientCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </IngredientCollectionList>

    <FireStateCard
      surface="collection"
      v-else
      icon="i-lucide-carrot"
      :title="
        query
          ? 'No ingredients match your search'
          : hasActiveFilters
            ? 'No ingredients match your filters'
            : 'No ingredients yet'
      "
      :description="
        query
          ? 'Try a different search term.'
          : hasActiveFilters
            ? 'Try a different category.'
            : 'Once ingredients are added, they will display here.'
      "
    />

    <div>
      <FireDiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="devJsonTitle"
        :context="devJsonContext"
        :objects="devJsonData"
        :derived="{}"
        :default-open="devJsonDefaultOpen"
        :hide-when-empty="devJsonHideWhenEmpty"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDiagnosticsCollectionJson } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsCollectionJson'
import { useCollectionRouteContext } from 'fireux-core/runtime/composables/shared/useCollectionRouteContext'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { computed, ref } from 'vue'
import {
  useIngredientInterface,
  type IngredientInterfaceItem,
} from '../../composables/useIngredientInterface'
import { INGREDIENT_CATEGORY_OPTIONS } from '../../models/ingredient-taxonomy'

const props = withDefaults(
  defineProps<{
    ingredients: IngredientInterfaceItem[]
    title?: string
    description?: string
    link?: boolean
    devJsonTitle?: string
    devJsonContext?: string
    devJsonData?: unknown
    devJsonDefaultOpen?: boolean
    devJsonHideWhenEmpty?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    collectionKey?: string
    baseRoute?: string
    resolveTo?: (id: string) => string
  }>(),
  {
    title: 'Ingredients',
    description: 'Browse global ingredients available to this runtime.',
    link: true,
    searchPlaceholder: 'Search ingredients...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    collectionKey: 'ingredients',
  }
)

const {
  interface: makeIngredientCard,
  pill: makeIngredientPill,
  cell: makeIngredientCell,
} = useIngredientInterface()
const makeCard = (ingredient: IngredientInterfaceItem) =>
  withIngredientRoute(makeIngredientCard(ingredient))
const makePill = (ingredient: IngredientInterfaceItem) =>
  withIngredientRoute(makeIngredientPill(ingredient))
const makeCell = (ingredient: IngredientInterfaceItem) =>
  withIngredientRoute(makeIngredientCell(ingredient))

const collection = computed<IngredientInterfaceItem[]>(() => props.ingredients)
const category = ref('all')
const categoryOptions = [
  { label: 'All categories', value: 'all' },
  ...INGREDIENT_CATEGORY_OPTIONS,
]
const filteredCollection = computed(() =>
  collection.value.filter(
    (ingredient) =>
      category.value === 'all' || ingredient.category === category.value
  )
)
const hasActiveFilters = computed(() => category.value !== 'all')
const { resolveTo } = useCollectionRouteContext({
  collectionKey: computed(() => props.collectionKey),
  baseRoute: computed(() => props.baseRoute),
  resolveTo: computed(() => props.resolveTo),
})
const withIngredientRoute = <T extends { id: string; to: string } | null>(
  card: T
): T => {
  if (!card) return card
  return { ...card, to: resolveTo(card.id) } as T
}
const sourceDevJsonCollection = computed(() =>
  Array.isArray(props.devJsonData)
    ? (props.devJsonData as IngredientInterfaceItem[])
    : collection.value
)
const {
  devJsonData: augmentedDevJsonData,
  loadDevJson,
  unloadDevJson,
} = useDiagnosticsCollectionJson(sourceDevJsonCollection)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search ingredients...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    IngredientInterfaceItem,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: filteredCollection,
    makeCard,
    searchText: (ingredient) =>
      [
        ingredient.id,
        ingredient.name,
        ...(Array.isArray(ingredient.aliases) ? ingredient.aliases : []),
        ingredient.category,
      ]
        .join(' ')
        .toLocaleLowerCase(),
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
  (showSearchInput.value && query.value) || hasActiveFilters.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)

const devJsonTitle = computed(() => props.devJsonTitle || 'Ingredients (JSON)')
const devJsonContext = computed(
  () => props.devJsonContext || 'collection presentation · ingredients'
)
const devJsonData = computed(
  () => props.devJsonData ?? augmentedDevJsonData.value
)
const devJsonDefaultOpen = computed(() => props.devJsonDefaultOpen ?? false)
const devJsonHideWhenEmpty = computed(() => props.devJsonHideWhenEmpty ?? true)
</script>
