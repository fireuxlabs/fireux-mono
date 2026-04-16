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
          <div class="ml-auto flex items-center gap-2">
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
              >{{ visibleCount }} / {{ totalCount }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <PortfolioCollectionList
      v-if="cardsFiltered.length"
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
import { usePortfolioInterface } from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../../models/portfolio.model'
import PortfolioCardsCell from '../Cards/Cell.vue'
import PortfolioCardsPill from '../Cards/Pill.vue'
import PortfolioCollectionList from './List.vue'

const props = withDefaults(
  defineProps<{
    collection?: Portfolio[]
    title?: string
    description?: string
    link?: boolean
    action?: boolean
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
    title: 'Available Portfolios',
    description: 'Browse portfolios available in this workspace.',
    link: false,
    action: false,
    showBadges: true,
    searchPlaceholder: 'Search portfolios…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    devJsonTitle: 'Portfolios (JSON)',
    devJsonContext: 'collection manager · portfolios · root: portfolios',
  }
)

const emit = defineEmits<{
  (event: 'select', portfolioId: string): void
}>()

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = usePortfolioInterface()
const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Available Portfolios'))
const description = computed(() => String(props.description || '').trim())
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showBadges = computed(() => props.showBadges !== false)
const totalCount = computed(() => collection.value.length)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search portfolios…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Portfolios (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · portfolios · root: portfolios'
  ).trim()
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
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

const isDev = import.meta.dev
</script>
