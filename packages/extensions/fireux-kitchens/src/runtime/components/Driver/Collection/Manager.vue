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
      entity="drivers"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="drivers"
      state="error"
      surface="bare"
    />

    <DriverCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <MoleculesStateCard
      v-else
      state="empty"
      surface="bare"
      :title="query ? 'No drivers match your search.' : 'No drivers found.'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Driver profiles will appear here once they are available.'
      "
    />

    <DevJson
      title="Drivers (JSON)"
      context="collection manager · drivers"
      :data="devJsonData"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useDriverFetch } from '../../../composables/fireux/firestore/profiles/Driver/fetch/useDriverFetch'
import { useDriverInterface } from '../../../composables/fireux/firestore/profiles/Driver/utils/view/useDriverInterface'
import type { Driver } from '../../../models/driver.model'

type DriverEntry = Driver & { user?: unknown }

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
    title: 'Drivers',
    description: 'Browse driver profiles available to this runtime.',
    searchPlaceholder: 'Search drivers...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useDriverFetch()
const { outcome } = fetched
const collection = computed<DriverEntry[]>(() => fetched.drivers.value)
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Drivers'))
const description = computed(() =>
  String(props.description || 'Browse driver profiles available to this runtime.')
)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search drivers...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showSettledCount = computed(
  () =>
    showCount.value &&
    (outcome.value === 'ready' || outcome.value === 'empty')
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useDriverInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<DriverEntry, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (entry) => makeCard(entry as Driver & { user?: any }),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((entry) =>
      variant.value === 'cell'
        ? makeCell(entry as Driver & { user?: any })
        : makePill(entry as Driver & { user?: any })
    )
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
