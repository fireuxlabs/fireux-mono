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
          <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
            <div
              v-if="showSectionToggle"
              class="flex flex-wrap items-center justify-end gap-1"
            >
              <UButton
                size="xs"
                color="neutral"
                :variant="activeSectionId === 'all' ? 'solid' : 'ghost'"
                @click="setActiveSection('all')"
              >
                All
              </UButton>
              <UButton
                v-for="section in sections"
                :key="section.id"
                size="xs"
                color="neutral"
                :variant="activeSectionId === section.id ? 'solid' : 'ghost'"
                @click="setActiveSection(section.id)"
              >
                {{ section.label }}
              </UButton>
            </div>
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

    <DishCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <DishCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <DishCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </DishCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{
        query
          ? 'No dishes match your search.'
          : activeSectionId === 'all'
            ? 'No dishes found.'
            : 'No dishes found in this section.'
      }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Dishes (JSON)'"
        context="collection manager · dishes"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed, ref, watch } from 'vue'
import { useDishInterface } from '../../../../composables/fireux/firestore/runtime-kitchen/dish/utils/view/useDishInterface'
import type { Dish } from '../../../../models/dish.model'

type DishCollectionSection = {
  id: string
  label: string
  dishIds: string[]
  count?: number
}

const props = withDefaults(
  defineProps<{
    collection?: Dish[]
    sections?: DishCollectionSection[]
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
    title: 'Dishes',
    description: 'Browse dishes available to this kitchen.',
    searchPlaceholder: 'Search dishes...',
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
} = useDishInterface()

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search dishes...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const sections = computed(() => props.sections ?? [])
const showSectionToggle = computed(() => sections.value.length > 0)
const activeSectionId = ref('all')

watch(
  sections,
  (nextSections) => {
    if (activeSectionId.value === 'all') return
    if (nextSections.some((section) => section.id === activeSectionId.value)) return
    activeSectionId.value = 'all'
  },
  { immediate: true }
)

const activeSection = computed(() =>
  sections.value.find((section) => section.id === activeSectionId.value) ?? null
)

const collectionFilteredBySection = computed(() => {
  if (!activeSection.value) return collection.value

  const order = new Map(
    activeSection.value.dishIds.map((dishId, index) => [dishId, index])
  )
  const filtered = collection.value.filter((dish) =>
    order.has(String(dish?.id ?? '').trim())
  )

  return filtered.sort(
    (a, b) =>
      (order.get(String(a?.id ?? '').trim()) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(String(b?.id ?? '').trim()) ?? Number.MAX_SAFE_INTEGER)
  )
})

const totalCount = computed(() => collectionFilteredBySection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)

const setActiveSection = (sectionId: string) => {
  activeSectionId.value = String(sectionId || 'all').trim() || 'all'
}

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Dish, NonNullable<ReturnType<typeof makeCard>>>({
    items: collectionFilteredBySection,
    makeCard: (dish: Dish) => makeCard(dish),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((dish) => {
      if (variant.value === 'cell') {
        const base = makeCard(dish)
        const cell = makeCell(dish)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(dish)
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
