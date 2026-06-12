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
          :action="card.canAct"
          :disabled="actionEnabled && !card.canAct"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <PortfolioCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="card.canAct"
          :disabled="actionEnabled && !card.canAct"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </PortfolioCollectionList>

    <p v-else>
      {{ query ? 'No portfolios match your search.' : 'No portfolios found.' }}
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
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/usePortfolio'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../models/portfolio.model'
import PortfolioCardsCell from '../Cards/Cell.vue'
import PortfolioCardsPill from '../Cards/Pill.vue'
import PortfolioCollectionList from './List.vue'

type PortfolioFilterMode = 'all' | 'mine' | 'console'
type PortfolioFilterOption = {
  value: PortfolioFilterMode
  label: string
}

const props = withDefaults(
  defineProps<{
    collection?: Portfolio[]
    pending?: boolean
    consoleIds?: string[]
    actionIds?: string[]
    filterMode?: PortfolioFilterMode
    filterOptions?: PortfolioFilterOption[]
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
    title: 'Available Portfolios',
    description: 'Browse portfolios available in this workspace.',
    link: true,
    action: false,
    actionIds: () => [],
    showBadges: true,
    searchPlaceholder: 'Search portfolios…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    showFilterToggle: false,
    initialVariant: 'pill',
    devJsonTitle: 'Portfolios (JSON)',
    devJsonContext: 'collection manager · portfolios · raw collection',
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', portfolioId: string): void
  (event: 'update:filterMode', value: PortfolioFilterMode): void
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
  props.pending || (Array.isArray(props.collection) ? false : fetched.pending.value)
)
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Available Portfolios'))
const description = computed(() => String(props.description || '').trim())
const filterMode = computed<PortfolioFilterMode>(() =>
  props.filterMode === 'mine' || props.filterMode === 'console'
    ? props.filterMode
    : 'all'
)
const filterOptions = computed<PortfolioFilterOption[]>(() =>
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
  String(props.searchPlaceholder || 'Search portfolios…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const showFilterToggle = computed(() => props.showFilterToggle === true)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
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
const collection = computed<Portfolio[]>(() =>
  rawCollection.value
    .filter((portfolio): portfolio is Portfolio => Boolean(makeCard(portfolio)))
    .filter((portfolio) => {
      if (filterMode.value !== 'console') return true
      return consoleIdSet.value.has(String(portfolio.id ?? '').trim())
    })
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

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Portfolio, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (portfolio) => makeCard(portfolio),
    initialVariant: props.initialVariant,
  })

type PortfolioManagerCard = NonNullable<ReturnType<typeof makeCard>> & {
  canAct: boolean
}

const cardsFiltered = computed<PortfolioManagerCard[]>(() =>
  visibleItems.value
    .map((portfolio) => {
      const canAct = cardCanAct(portfolio.id)

      if (variant.value === 'cell') {
        const base = makeCard(portfolio)
        const cell = makeCell(portfolio)
        if (!base || !cell) return null
        return { ...base, ...cell, canAct }
      }

      const pill = makePill(portfolio)
      return pill ? { ...pill, canAct } : null
    })
    .filter((card): card is PortfolioManagerCard => Boolean(card))
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)

function setFilterMode(value: PortfolioFilterMode) {
  emit('update:filterMode', value)
}
</script>
