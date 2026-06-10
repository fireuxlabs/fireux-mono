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
            <UBadge
              v-if="showCountBadge"
              variant="soft"
              color="neutral"
            >
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <SupplierCatalogueCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
    >
      <template #pill="{ card }">
        <SupplierCatalogueCardsPill
          v-bind="card"
          :show-header="cardsFiltered.length > 1"
        />
      </template>
    </SupplierCatalogueCollectionList>

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
  useSupplierCatalogueInterface,
  type SupplierCatalogueInterfaceItem,
} from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierCatalogueInterface'

const props = withDefaults(
  defineProps<{
    collection?: SupplierCatalogueInterfaceItem[]
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
    title: 'Supplier Catalogues',
    description: 'Browse supplier catalogue grouping surfaces.',
    searchPlaceholder: 'Search supplier catalogues...',
    showSearch: true,
    showCount: true,
    emptyTitle: 'No catalogues',
    emptyDescription: 'No supplier catalogues found.',
    devContext: 'supplier catalogue collection manager',
  }
)

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Supplier Catalogues'))
const description = computed(() => String(props.description || ''))
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search supplier catalogues...')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const showCountBadge = computed(() => showCount.value && totalCount.value > 1)
const emptyStateTitle = computed(() =>
  props.pending ? 'Loading catalogues' : props.emptyTitle
)
const emptyStateDescription = computed(() =>
  props.pending ? 'Fetching supplier catalogues.' : props.emptyDescription
)
const {
  interface: makeCard,
} = useSupplierCatalogueInterface()

const { query, visibleItems, visibleCount } = useCollectionSearch<
  SupplierCatalogueInterfaceItem,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (item: SupplierCatalogueInterfaceItem) => makeCard(item),
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
const devJsonContext = computed(() => String(props.devContext))
</script>
