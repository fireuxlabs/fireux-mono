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
                @click="emit('update:sourceMode', 'live')"
              >
                Live
              </UButton>
              <UButton
                :variant="sourceMode === 'demo' ? 'solid' : 'ghost'"
                color="neutral"
                @click="emit('update:sourceMode', 'demo')"
              >
                Demo
              </UButton>
              <UButton
                :variant="sourceMode === 'test' ? 'solid' : 'ghost'"
                color="neutral"
                @click="emit('update:sourceMode', 'test')"
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

    <OrganismsKitchenCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <OrganismsKitchenCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <OrganismsKitchenCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-source="showBadges"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </OrganismsKitchenCollectionList>

    <p v-else>
      {{ query ? 'No kitchens match your search.' : 'No kitchens found.' }}
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
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../../../models/kitchen.model'

const props = withDefaults(
  defineProps<{
    collection?: Kitchen[]
    filterMode?: 'all' | 'mine'
    sourceMode?: 'live' | 'demo' | 'test'
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
    showSourceToggle?: boolean
    showBadges?: boolean
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    collection: () => [],
    filterMode: 'all',
    sourceMode: 'live',
    title: 'Kitchens',
    description: 'Browse kitchen records available to this runtime.',
    searchPlaceholder: 'Search kitchens…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
    action: false,
    showFilterToggle: false,
    showSourceToggle: false,
    showBadges: true,
    devJsonTitle: 'Kitchens (JSON)',
    devJsonContext: 'collection manager · kitchens · raw collection',
  }
)

const emit = defineEmits<{
  (event: 'select', kitchenId: string): void
  (event: 'update:filterMode', value: 'all' | 'mine'): void
  (event: 'update:sourceMode', value: 'live' | 'demo' | 'test'): void
}>()

const rawCollection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Kitchens'))
const description = computed(() =>
  String(
    props.description || 'Browse kitchen records available to this runtime.'
  ).trim()
)
const filterMode = computed<'all' | 'mine'>(() =>
  props.filterMode === 'mine' ? 'mine' : 'all'
)
const sourceMode = computed<'live' | 'demo' | 'test'>(() => {
  if (props.sourceMode === 'demo') return 'demo'
  if (props.sourceMode === 'test') return 'test'
  return 'live'
})
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search kitchens…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showFilterToggle = computed(() => props.showFilterToggle === true)
const showSourceToggle = computed(() => props.showSourceToggle === true)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showBadges = computed(() => props.showBadges !== false)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Kitchens (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · kitchens · raw collection'
  ).trim()
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useKitchenInterface()

const collection = computed<Kitchen[]>(() =>
  rawCollection.value.filter((row): row is Kitchen => Boolean(makeCard(row)))
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Kitchen, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (kitchen: Kitchen) => makeCard(kitchen),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((kitchen) => {
      if (variant.value === 'cell') {
        const base = makeCard(kitchen)
        const cell = makeCell(kitchen)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(kitchen)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
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
