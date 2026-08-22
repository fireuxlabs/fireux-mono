<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
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

            <UBadge v-if="showSettledCount" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="customers"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="customers"
      state="error"
      surface="bare"
    />

    <CustomerCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <MoleculesStateCard
      v-else
      state="empty"
      surface="bare"
      :title="query ? 'No customers match your search.' : 'No customers found.'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Customer profiles will appear here once they are available.'
      "
    />

    <DevDebugPanel
      object-origin="fetched"
      launcher
      include-route
      title="Customers (JSON)"
      context="collection manager · customers"
      :objects="devJsonData"
      :derived="{}"
      :default-open="false"
      @opened="loadDevJson"
      @closed="unloadDevJson"
    />
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: adapt profile entries to shared card mechanics.
import { computed } from 'vue'
import { useCustomerFetch } from '../../../composables/firestore/profiles/Customer/fetch/useCustomerFetch'
import { useCustomerInterface } from '../../../composables/customer/useCustomerInterface'
import type { Customer } from '../../../utils/customer.ts'

type CustomerEntry = Partial<Customer> & {
  id: string
  user?: unknown
  appUser?: unknown
}

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Customers',
    description: 'Browse customer profiles available to this runtime.',
    searchPlaceholder: 'Search customers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useCustomerFetch()
const { outcome } = fetched
const collection = computed<CustomerEntry[]>(
  () => (fetched.customers.value ?? []) as CustomerEntry[]
)
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Customers'))
const description = computed(() =>
  String(
    props.description || 'Browse customer profiles available to this runtime.'
  )
)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search customers…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showSettledCount = computed(
  () =>
    showCount.value && (outcome.value === 'ready' || outcome.value === 'empty')
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useCustomerInterface()
type CustomerInterfaceTarget = NonNullable<Parameters<typeof makeCard>[0]>
const asCustomerInterfaceTarget = (entry: CustomerEntry) =>
  entry as CustomerInterfaceTarget
const makeEntryCard = (entry: CustomerEntry) =>
  makeCard(asCustomerInterfaceTarget(entry))
const makeEntryPill = (entry: CustomerEntry) =>
  makePill(asCustomerInterfaceTarget(entry))
const makeEntryCell = (entry: CustomerEntry) =>
  makeCell(asCustomerInterfaceTarget(entry))
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<CustomerEntry, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: makeEntryCard,
    initialVariant: props.initialVariant,
  })

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard: makeEntryCard,
  makePill: makeEntryPill,
  makeCell: makeEntryCell,
  cellMode: 'replace',
})

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
