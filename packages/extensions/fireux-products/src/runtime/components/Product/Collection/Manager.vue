<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls"
        >
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
            <UBadge
              v-if="showCount && outcome !== 'pending' && outcome !== 'error'"
              variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="products"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="products"
      state="error"
      surface="bare"
    />

    <ProductCollectionList
      v-else-if="cardsFiltered.length"
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
      v-else
      entity="products"
      state="empty"
      surface="bare"
      :title="query ? 'No products match your search' : 'No products yet'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Once product records are added, they will display here.'
      "
    />

    <div>
      <DevJson
        :title="'Products (JSON)'"
        :context="devJsonContext"
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
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
import { computed } from 'vue'
import { useProductCollection } from '../../../composables/fireux/firestore/product/fetch/useProductCollection'
import { useProductInterface } from '../../../composables/fireux/product/useProductInterface'
import type { FirebaseProduct } from '../../../models/product.model'

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

const fetched = useProductCollection()
const collection = computed<FirebaseProduct[]>(() => fetched.products.value ?? [])
const outcome = computed(() => fetched.outcome.value)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(collection)
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
  useCollectionSearch<
    FirebaseProduct,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (product: FirebaseProduct) => makeCard(product),
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
  () => `collection manager · products · root: ${productCollectionRoot}`
)
</script>
