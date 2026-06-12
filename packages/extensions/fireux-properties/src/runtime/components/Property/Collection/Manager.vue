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
            <UBadge v-if="showCount" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <p v-if="pending">Loading properties...</p>

    <PropertyCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <PropertyCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="card.canAct"
          :disabled="actionEnabled && !card.canAct"
          :show-meta="true"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <PropertyCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="card.canAct"
          :disabled="actionEnabled && !card.canAct"
          :show-meta="true"
          @action="emit('select', card.id)"
        />
      </template>
    </PropertyCollectionList>

    <p v-else>
      {{ query ? 'No properties match your search.' : 'No properties found.' }}
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
import { usePropertyCollection } from '../../../composables/fireux/firestore/property/useProperty'
import { usePropertyInterface } from '../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'
import type { Property } from '../../../models/property.model'
import PropertyCardsCell from '../Cards/Cell.vue'
import PropertyCardsPill from '../Cards/Pill.vue'
import PropertyCollectionList from './List.vue'

type PropertyFilterMode = 'all' | 'mine' | 'console'
type PropertyFilterOption = {
  value: PropertyFilterMode
  label: string
}

const props = withDefaults(
  defineProps<{
    collection?: Property[]
    pending?: boolean
    consoleIds?: string[]
    actionIds?: string[]
    filterMode?: PropertyFilterMode
    filterOptions?: PropertyFilterOption[]
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
    action?: boolean
    showFilterToggle?: boolean
    showBadges?: boolean
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    filterMode: 'all',
    filterOptions: () => [
      { value: 'all', label: 'All' },
      { value: 'mine', label: 'Mine' },
    ],
    title: 'Properties',
    description: 'Browse property records available to this runtime.',
    searchPlaceholder: 'Search properties...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
    action: false,
    actionIds: () => [],
    showFilterToggle: false,
    showBadges: true,
    devJsonTitle: 'Properties (JSON)',
    devJsonContext: 'collection manager · properties',
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', propertyId: string): void
  (event: 'update:filterMode', value: PropertyFilterMode): void
}>()

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = usePropertyInterface()

const fetched = usePropertyCollection()
const rawCollection = computed(() =>
  Array.isArray(props.collection) ? props.collection : fetched.properties.value
)
const pending = computed(() =>
  props.pending || (Array.isArray(props.collection) ? false : fetched.pending.value)
)
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Properties'))
const description = computed(() => String(props.description || '').trim())
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search properties...')
)
const filterMode = computed<PropertyFilterMode>(() =>
  props.filterMode === 'mine' || props.filterMode === 'console'
    ? props.filterMode
    : 'all'
)
const filterOptions = computed<PropertyFilterOption[]>(() =>
  Array.isArray(props.filterOptions) && props.filterOptions.length
    ? props.filterOptions
    : [
        { value: 'all', label: 'All' },
        { value: 'mine', label: 'Mine' },
      ]
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showFilterToggle = computed(() => props.showFilterToggle === true)
const showBadges = computed(() => props.showBadges !== false)
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
const collection = computed<Property[]>(() =>
  rawCollection.value.filter((property) => {
    if (filterMode.value !== 'console') return true
    return consoleIdSet.value.has(String(property.id ?? '').trim())
  })
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Property, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (property: Property) => makeCard(property),
    initialVariant: props.initialVariant,
  })

type PropertyManagerCard = NonNullable<ReturnType<typeof makeCard>> & {
  canAct: boolean
}

const cardsFiltered = computed<PropertyManagerCard[]>(() =>
  visibleItems.value
    .map((property) => {
      const canAct = cardCanAct(property.id)

      if (variant.value === 'cell') {
        const base = makeCard(property)
        const cell = makeCell(property)
        if (!base || !cell) return null
        return { ...base, ...cell, canAct }
      }

      const pill = makePill(property)
      return pill ? { ...pill, canAct } : null
    })
    .filter((card): card is PropertyManagerCard => Boolean(card))
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Properties (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(props.devJsonContext || 'collection manager · properties').trim()
)

function setFilterMode(value: PropertyFilterMode) {
  emit('update:filterMode', value)
}
</script>
