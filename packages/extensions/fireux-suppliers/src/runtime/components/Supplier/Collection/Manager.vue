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
          <div class="ml-auto flex flex-wrap items-center gap-2">
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

            <UBadge v-if="showCount && isSettled" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="suppliers"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="suppliers"
      state="error"
      surface="bare"
      description="Suppliers could not be loaded. Please try again."
    />

    <SupplierCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <SupplierCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
      <template #cell="{ card }">
        <SupplierCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
    </SupplierCollectionList>

    <MoleculesStateCard
      v-else
      entity="suppliers"
      state="empty"
      surface="bare"
      :title="query ? 'No matching suppliers' : 'No suppliers yet'"
      :description="query
        ? 'Try a different supplier name.'
        : 'Suppliers will appear here when they are available.'"
    />

    <div>
      <DevJson
        :title="devJsonTitle"
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
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/useSupplier'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    link?: boolean
    showBadges?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Suppliers',
    description: 'Browse supplier records available to this runtime.',
    link: true,
    showBadges: true,
    searchPlaceholder: 'Search suppliers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    devJsonTitle: 'Suppliers (JSON)',
    devJsonContext: 'collection manager · suppliers · raw collection',
  }
)

const fetched = useSupplierCollection()
const rawCollection = computed(() => fetched.suppliers.value)
const outcome = computed(() => fetched.outcome.value)
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Suppliers'))
const description = computed(() =>
  String(
    props.description || 'Browse supplier records available to this runtime.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search suppliers…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Suppliers (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · suppliers · raw collection'
  ).trim()
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useSupplierInterface()

const collection = computed<Supplier[]>(() =>
  rawCollection.value
    .filter((entry): entry is Supplier => Boolean(makeCard(entry as Supplier)))
)
const totalCount = computed(() => collection.value.length)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Supplier, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (entry) => makeCard(entry),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((entry) => {
      if (variant.value === 'cell') {
        const base = makeCard(entry)
        const cell = makeCell(entry)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(entry)
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

</script>
