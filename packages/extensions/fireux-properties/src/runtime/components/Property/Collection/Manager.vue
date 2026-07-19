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
            <UBadge v-if="showCount && isSettled" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="properties"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="properties"
      state="error"
      surface="bare"
      description="Properties could not be loaded. Please try again."
    />

    <PropertyCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <PropertyCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-meta="true"
          :show-badges="showBadges"
        />
      </template>
      <template #cell="{ card }">
        <PropertyCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-meta="true"
        />
      </template>
    </PropertyCollectionList>

    <MoleculesStateCard
      v-else
      entity="properties"
      state="empty"
      surface="bare"
      :title="query ? 'No matching properties' : 'No properties yet'"
      :description="query
        ? 'Try a different property name.'
        : 'Properties will appear here when they are available.'"
    />

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

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
    showBadges?: boolean
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Properties',
    description: 'Browse property records available to this runtime.',
    searchPlaceholder: 'Search properties...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
    showBadges: true,
    devJsonTitle: 'Properties (JSON)',
    devJsonContext: 'collection manager · properties',
  }
)

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = usePropertyInterface()

const fetched = usePropertyCollection()
const rawCollection = computed(() => fetched.properties.value)
const outcome = computed(() => fetched.outcome.value)
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Properties'))
const description = computed(() => String(props.description || '').trim())
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search properties...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const showBadges = computed(() => props.showBadges !== false)
const collection = computed<Property[]>(() =>
  rawCollection.value.filter((property): property is Property =>
    Boolean(makeCard(property))
  )
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

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((property) => {
      if (variant.value === 'cell') {
        const base = makeCard(property)
        const cell = makeCell(property)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(property)
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
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Properties (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(props.devJsonContext || 'collection manager · properties').trim()
)

</script>
