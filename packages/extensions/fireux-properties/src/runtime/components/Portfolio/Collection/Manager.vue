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
            </UFieldGroup>

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

    <p v-if="pending">Loading portfolios...</p>

    <PortfolioCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <PortfolioCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <PortfolioCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </PortfolioCollectionList>

    <p v-else>
      {{ query ? 'No portfolios match your search.' : 'No portfolios found.' }}
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
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/usePortfolio'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../models/portfolio.model'
import PortfolioCardsCell from '../Cards/Cell.vue'
import PortfolioCardsPill from '../Cards/Pill.vue'
import PortfolioCollectionList from './List.vue'

const props = withDefaults(
  defineProps<{
    collection?: Portfolio[]
    filterMode?: 'all' | 'mine'
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
    title: 'Available Portfolios',
    description: 'Browse portfolios available in this workspace.',
    link: true,
    action: false,
    showBadges: true,
    searchPlaceholder: 'Search portfolios…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    showFilterToggle: false,
    initialVariant: 'pill',
    devJsonTitle: 'Portfolios (JSON)',
    devJsonContext: 'collection manager · portfolios · raw collection',
  }
)

const emit = defineEmits<{
  (event: 'select', portfolioId: string): void
  (event: 'update:filterMode', value: 'all' | 'mine'): void
}>()

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = usePortfolioInterface()
const fetched = usePortfolioCollection()
const rawCollection = computed(() =>
  Array.isArray(props.collection) ? props.collection : fetched.portfolios.value
)
const pending = computed(() =>
  Array.isArray(props.collection) ? false : fetched.pending.value
)
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Available Portfolios'))
const description = computed(() => String(props.description || '').trim())
const filterMode = computed<'all' | 'mine'>(() =>
  props.filterMode === 'mine' ? 'mine' : 'all'
)
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showBadges = computed(() => props.showBadges !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search portfolios…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const showFilterToggle = computed(() => props.showFilterToggle === true)
const collection = computed<Portfolio[]>(() =>
  rawCollection.value.filter((portfolio): portfolio is Portfolio =>
    Boolean(makeCard(portfolio))
  )
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Portfolios (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · portfolios · raw collection'
  ).trim()
)

const { query, variant, visibleItems, visibleCount } =
  useCollectionSearch<Portfolio, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (portfolio) => makeCard(portfolio),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((portfolio) => {
      if (variant.value === 'cell') {
        const base = makeCard(portfolio)
        const cell = makeCell(portfolio)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(portfolio)
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
</script>
