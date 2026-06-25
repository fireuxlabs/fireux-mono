<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
          <div class="ml-auto flex items-center gap-2">
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

    <p v-else>
      {{ query ? 'No products match your search.' : 'No products found.' }}
    </p>

    <div>
      <DevJson
        :title="'Products (JSON)'"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useProductCollection } from '../../../composables/fireux/firestore/product/fetch/useProductCollection'
import { useProductInterface } from '../../../composables/fireux/firestore/product/utils/view/useProductInterface'
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
const { devJsonData } = useDevCollectionJson(collection)
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

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((product) => {
      if (variant.value === 'cell') {
        const base = makeCard(product)
        const cell = makeCell(product)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(product)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

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
