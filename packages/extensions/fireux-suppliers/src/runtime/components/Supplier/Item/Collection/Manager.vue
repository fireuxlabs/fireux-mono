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
            <UBadge v-if="showCount" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <SupplierItemCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <SupplierItemCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <SupplierItemCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </SupplierItemCollectionList>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="emptyStateTitle"
      :description="emptyStateDescription"
    />

    <div>
      <DevJson
        :title="`${title} (JSON)`"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import {
  useSupplierItemInterface,
  type SupplierItemSurface,
} from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierItemInterface'

const props = withDefaults(
  defineProps<{
    collection?: SupplierItemSurface[]
    pending?: boolean
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    emptyTitle?: string
    emptyDescription?: string
    devContext?: string
  }>(),
  {
    title: 'Items',
    description: 'Browse supplier item offers.',
    pending: false,
    link: false,
    searchPlaceholder: 'Search supplier items...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    emptyTitle: 'No items',
    emptyDescription: 'No supplier items found.',
    devContext: 'supplier item collection manager',
  }
)

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Items'))
const description = computed(() =>
  String(props.description || 'Browse supplier item offers.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search supplier items...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const emptyTitle = computed(() => String(props.emptyTitle || 'No items'))
const emptyDescription = computed(() =>
  String(props.emptyDescription || 'No supplier items found.')
)
const emptyStateTitle = computed(() =>
  props.pending ? 'Loading items' : emptyTitle.value
)
const emptyStateDescription = computed(() =>
  props.pending ? 'Fetching supplier items.' : emptyDescription.value
)

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useSupplierItemInterface()

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    SupplierItemSurface,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (item: SupplierItemSurface) => makeCard(item),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((item) => {
      if (variant.value === 'cell') {
        const base = makeCard(item)
        const cell = makeCell(item)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(item)
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
const devJsonContext = computed(() => String(props.devContext))
</script>
