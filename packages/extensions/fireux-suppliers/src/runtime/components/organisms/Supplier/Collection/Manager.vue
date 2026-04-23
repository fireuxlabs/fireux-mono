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
            <UButtonGroup v-if="showSourceToggle" size="xs">
              <UButton
                :variant="sourceMode === 'live' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('live')"
              >
                Live
              </UButton>
              <UButton
                :variant="sourceMode === 'demo' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('demo')"
              >
                Demo
              </UButton>
              <UButton
                :variant="sourceMode === 'test' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('test')"
              >
                Test
              </UButton>
            </UButtonGroup>

            <UButtonGroup v-if="showFilterToggle" size="xs">
              <UButton
                :variant="filterMode === 'all' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setFilterMode('all')"
              >
                All
              </UButton>
              <UButton
                :variant="filterMode === 'mine' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setFilterMode('mine')"
              >
                Mine
              </UButton>
            </UButtonGroup>

            <UInput
              v-if="showSearchInput"
              v-model="query"
              size="xs"
              :placeholder="searchPlaceholder"
            />

            <UBadge v-if="showCount" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <SupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <SupplierCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <SupplierCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </SupplierCollectionList>

    <p v-else>
      {{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}
    </p>

    <div v-if="isDev">
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
import type { Supplier } from '../../../../models/supplier/Supplier.model'
import { useSupplierInterface } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

type SupplierEntry = Supplier & { user?: unknown }

const props = withDefaults(
  defineProps<{
    collection?: SupplierEntry[]
    filterMode?: 'all' | 'mine'
    sourceMode?: 'live' | 'demo' | 'test'
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
    showSourceToggle?: boolean
    initialVariant?: 'pill' | 'cell'
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    collection: () => [],
    filterMode: 'all',
    sourceMode: 'live',
    title: 'Suppliers',
    description: 'Browse supplier records available to this runtime.',
    link: true,
    action: false,
    showBadges: true,
    searchPlaceholder: 'Search suppliers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    showFilterToggle: false,
    showSourceToggle: false,
    initialVariant: 'pill',
    devJsonTitle: 'Suppliers (JSON)',
    devJsonContext: 'collection manager · suppliers · raw collection',
  }
)

const emit = defineEmits<{
  (event: 'select', supplierId: string): void
  (event: 'update:filterMode', value: 'all' | 'mine'): void
  (event: 'update:sourceMode', value: 'live' | 'demo' | 'test'): void
}>()

const rawCollection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Suppliers'))
const description = computed(() =>
  String(
    props.description || 'Browse supplier records available to this runtime.'
  )
)
const filterMode = computed<'all' | 'mine'>(() =>
  props.filterMode === 'mine' ? 'mine' : 'all'
)
const sourceMode = computed<'live' | 'demo' | 'test'>(() => {
  if (props.sourceMode === 'demo') return 'demo'
  if (props.sourceMode === 'test') return 'test'
  return 'live'
})
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search suppliers…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const showFilterToggle = computed(() => props.showFilterToggle === true)
const showSourceToggle = computed(() => props.showSourceToggle === true)
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

const collection = computed<SupplierEntry[]>(() =>
  rawCollection.value.filter((entry): entry is SupplierEntry =>
    Boolean(makeCard(entry as Supplier, (entry as any)?.user ?? null))
  )
)
const totalCount = computed(() => collection.value.length)

const { query, variant, visibleItems, visibleCount } =
  useCollectionSearch<SupplierEntry, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (entry) =>
      makeCard(entry as Supplier, (entry as any)?.user ?? null),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((entry) => {
      const user = (entry as any)?.user ?? null

      if (variant.value === 'cell') {
        const base = makeCard(entry as Supplier, user)
        const cell = makeCell(entry as Supplier, user)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(entry as Supplier, user)
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
const isDev = import.meta.dev

function setFilterMode(value: 'all' | 'mine') {
  emit('update:filterMode', value)
}

function setSourceMode(value: 'live' | 'demo' | 'test') {
  emit('update:sourceMode', value)
}
</script>
