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
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <UFieldGroup v-if="showFilterToggle" size="xs">
              <UButton
                v-for="option in filterOptions"
                :key="option.value"
                :variant="filterMode === option.value ? 'solid' : 'ghost'"
                color="neutral"
                @click="setFilterMode(option.value)"
              >
                {{ option.label }}
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

            <UBadge v-if="showCount" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <p v-if="pending">Loading suppliers...</p>

    <SupplierCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <SupplierCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="card.canAct"
          :disabled="actionEnabled && !card.canAct"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <SupplierCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="card.canAct"
          :disabled="actionEnabled && !card.canAct"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </SupplierCollectionList>

    <p v-else>
      {{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}
    </p>

    <div>
      <DevJson
        :title="devJsonTitle"
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
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/useSupplier'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

type SupplierFilterMode = 'all' | 'mine' | 'console'
type SupplierFilterOption = {
  value: SupplierFilterMode
  label: string
}

const props = withDefaults(
  defineProps<{
    collection?: Supplier[]
    consoleIds?: string[]
    actionIds?: string[]
    filterMode?: SupplierFilterMode
    filterOptions?: SupplierFilterOption[]
    title?: string
    description?: string
    link?: boolean
    action?: boolean
    showBadges?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    showFilterToggle?: boolean
    initialVariant?: 'pill' | 'cell'
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    filterMode: 'all',
    filterOptions: () => [
      { value: 'all', label: 'All' },
      { value: 'mine', label: 'Mine' },
    ],
    title: 'Suppliers',
    description: 'Browse supplier records available to this runtime.',
    link: true,
    action: false,
    actionIds: () => [],
    showBadges: true,
    searchPlaceholder: 'Search suppliers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    showFilterToggle: false,
    initialVariant: 'pill',
    devJsonTitle: 'Suppliers (JSON)',
    devJsonContext: 'collection manager · suppliers · raw collection',
  }
)

const emit = defineEmits<{
  (event: 'select', supplierId: string): void
  (event: 'update:filterMode', value: SupplierFilterMode): void
}>()

const fetched = useSupplierCollection()
const rawCollection = computed(() =>
  Array.isArray(props.collection) ? props.collection : fetched.suppliers.value
)
const pending = computed(() =>
  Array.isArray(props.collection) ? false : fetched.pending.value
)
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Suppliers'))
const description = computed(() =>
  String(
    props.description || 'Browse supplier records available to this runtime.'
  )
)
const filterMode = computed<SupplierFilterMode>(() =>
  props.filterMode === 'mine' || props.filterMode === 'console'
    ? props.filterMode
    : 'all'
)
const filterOptions = computed<SupplierFilterOption[]>(() =>
  Array.isArray(props.filterOptions) && props.filterOptions.length
    ? props.filterOptions
    : [
        { value: 'all', label: 'All' },
        { value: 'mine', label: 'Mine' },
      ]
)
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search suppliers…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const showFilterToggle = computed(() => props.showFilterToggle === true)
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

const consoleIdSet = computed(
  () =>
    new Set(
      (props.consoleIds ?? [])
        .map((id) => String(id ?? '').trim())
        .filter(Boolean)
    )
)
const actionIdSet = computed(
  () =>
    new Set(
      (props.actionIds ?? [])
        .map((id) => String(id ?? '').trim())
        .filter(Boolean)
    )
)
const cardCanAct = (cardId: unknown) => {
  if (!actionEnabled.value) return false
  const actionIds = props.actionIds ?? []
  if (!actionIds.length) return true
  return actionIdSet.value.has(String(cardId ?? '').trim())
}
const collection = computed<Supplier[]>(() =>
  rawCollection.value
    .filter((entry): entry is Supplier => Boolean(makeCard(entry as Supplier)))
    .filter((entry) => {
      if (filterMode.value !== 'console') return true
      return consoleIdSet.value.has(String(entry.id ?? '').trim())
    })
)
const totalCount = computed(() => collection.value.length)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Supplier, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (entry) => makeCard(entry),
    initialVariant: props.initialVariant,
  })

type SupplierManagerCard = NonNullable<ReturnType<typeof makeCard>> & {
  canAct: boolean
}

const cardsFiltered = computed<SupplierManagerCard[]>(() =>
  visibleItems.value
    .map((entry) => {
      const canAct = cardCanAct(entry.id)

      if (variant.value === 'cell') {
        const base = makeCard(entry)
        const cell = makeCell(entry)
        if (!base || !cell) return null
        return { ...base, ...cell, canAct }
      }

      const pill = makePill(entry)
      return pill ? { ...pill, canAct } : null
    })
    .filter((card): card is SupplierManagerCard => Boolean(card))
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)

function setFilterMode(value: SupplierFilterMode) {
  emit('update:filterMode', value)
}
</script>
