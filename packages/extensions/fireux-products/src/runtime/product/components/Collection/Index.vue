<template>
  <section class="entity-collection product-collection">
    <CollectionHeader :title="title" :description="description">
      <template #controls>
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

    <ProductCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ProductCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <ProductCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </ProductCollectionList>

    <MoleculesStateCard
      surface="collection"
      v-else
      icon="i-lucide-box"
      :title="query ? 'No products match your search' : 'No products yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once product records are added, they will display here.'
      "
    />

    <div>
      <DiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="'Products (JSON)'"
        :context="devJsonContext"
        :objects="devJsonData"
        :derived="devJsonDerived"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDiagnosticsCollectionJson } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsCollectionJson'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import { useProductInterface } from '../../composables/useProductInterface'
import type { Product } from '../../utils/product.ts'

const props = withDefaults(
  defineProps<{
    products: Product[]
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
    title: 'Products',
    description: 'Browse product records available to this runtime.',
    link: true,
    searchPlaceholder: 'Search products…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed<Product[]>(() => props.products)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDiagnosticsCollectionJson(collection)
const title = computed(() => String(props.title || 'Products'))
const description = computed(() =>
  String(
    props.description || 'Browse product records available to this runtime.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search products…')
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
} = useProductInterface()

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Product, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (product: Product) => makeCard(product),
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
const { getCollectionPath } = useFirestoreManager()
const productCollectionRoot = getCollectionPath('products', false)
const devJsonContext = computed(
  () => `collection presentation · products · root: ${productCollectionRoot}`
)
const devJsonDerived = computed(() => ({
  source: productCollectionRoot,
  cards: cardsFiltered.value,
  count: totalCount.value,
  visibleCount: visibleCount.value,
  query: query.value,
  variant: variant.value,
  link: linkEnabled.value,
}))
</script>
