<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
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
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MiseCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <MiseCardsPill v-bind="card" :link="linkEnabled" />
      </template>

      <template #cell="{ card }">
        <MiseCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </MiseCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No mise tasks match your search.' : 'No mise tasks found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Mise Tasks (JSON)'"
        context="collection manager · mise"
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
import { useMiseEnPlaceInterface } from '../../../../composables/fireux/firestore/runtime-kitchen/mise/utils/view/useMiseEnPlaceInterface'
import type { KitchenMiseTask } from '../../../../models/kitchen-mise.model'
import MiseCardsCell from '../Cards/Cell.vue'
import MiseCardsPill from '../Cards/Pill.vue'
import MiseCollectionList from './List.vue'

const props = withDefaults(
  defineProps<{
    collection?: KitchenMiseTask[]
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
  }>(),
  {
    title: 'Mise Tasks',
    description: 'Browse mise tasks for this kitchen.',
    searchPlaceholder: 'Search mise tasks...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
  }
)

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useMiseEnPlaceInterface()

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search mise tasks...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    KitchenMiseTask,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (task: KitchenMiseTask) => makeCard(task),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((task) => {
      if (variant.value === 'cell') {
        const base = makeCard(task)
        const cell = makeCell(task)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(task)
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
</script>
