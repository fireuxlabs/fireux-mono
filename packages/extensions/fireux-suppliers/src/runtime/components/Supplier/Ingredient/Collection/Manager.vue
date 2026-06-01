<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
          <div class="ml-auto flex items-center gap-2">
            <UInput
              v-if="showSearchInput"
              v-model="query"
              size="xs"
              :placeholder="searchPlaceholder"
            />
            <UBadge v-if="showCount" variant="soft" color="neutral">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="cardsFiltered.length"
      class="grid gap-3 md:grid-cols-2"
    >
      <div
        v-for="card in cardsFiltered"
        :key="card.id"
        class="rounded-lg border border-default bg-default p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <h3 class="truncate text-sm font-semibold text-highlighted">
              {{ card.title }}
            </h3>
            <UBadge
              :label="card.ingredientId"
              color="neutral"
              variant="soft"
              size="xs"
            />
          </div>

          <UIcon name="i-lucide-wheat" class="size-4 shrink-0 text-muted" />
        </div>

        <p
          v-if="card.path"
          class="mt-3 break-all text-xs text-muted"
        >
          {{ card.path }}
        </p>
      </div>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="emptyStateTitle"
      :description="emptyStateDescription"
    />

    <div v-if="isDev">
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
  useSupplierIngredientInterface,
  type SupplierIngredientInterfaceItem,
} from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierIngredientInterface'

const props = withDefaults(
  defineProps<{
    collection?: SupplierIngredientInterfaceItem[]
    pending?: boolean
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showCount?: boolean
    emptyTitle?: string
    emptyDescription?: string
    devContext?: string
  }>(),
  {
    collection: () => [],
    pending: false,
    title: 'Supplier Ingredients',
    description: 'Ingredients this supplier covers.',
    searchPlaceholder: 'Search supplier ingredients...',
    showSearch: true,
    showCount: true,
    emptyTitle: 'No supplier ingredients',
    emptyDescription: 'Select ingredients from the global dictionary before adding product lines.',
    devContext: 'supplier ingredient collection manager',
  }
)

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Supplier Ingredients'))
const description = computed(() => String(props.description || ''))
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search supplier ingredients...')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const emptyTitle = computed(() => String(props.emptyTitle || 'No supplier ingredients'))
const emptyDescription = computed(() =>
  String(props.emptyDescription || 'No supplier ingredients found.')
)
const emptyStateTitle = computed(() =>
  props.pending ? 'Loading supplier ingredients' : emptyTitle.value
)
const emptyStateDescription = computed(() =>
  props.pending ? 'Fetching supplier ingredients.' : emptyDescription.value
)

const { interface: makeCard } = useSupplierIngredientInterface()
const { query, visibleItems, visibleCount } = useCollectionSearch<
  SupplierIngredientInterfaceItem,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (item: SupplierIngredientInterfaceItem) => makeCard(item),
  initialVariant: 'pill',
})

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((item) => makeCard(item))
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
const isDev = import.meta.dev
const devJsonContext = computed(() => String(props.devContext))
</script>
