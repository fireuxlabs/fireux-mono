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
              v-if="showFilters"
              class="flex flex-wrap items-center justify-end gap-1"
            >
              <UFieldGroup
                v-if="showMenuFilter"
                size="xs"
              >
                <UButton
                  color="neutral"
                  :variant="activeMenuId === 'all' ? 'solid' : 'ghost'"
                  @click="setActiveMenu('all')"
                >
                  All
                </UButton>
                <UButton
                  v-for="menu in menuFilters"
                  :key="menu.id"
                  color="neutral"
                  :variant="activeMenuId === menu.id ? 'solid' : 'ghost'"
                  @click="setActiveMenu(menu.id)"
                >
                  {{ filterButtonLabel(menu.label, menu.count) }}
                </UButton>
              </UFieldGroup>

              <UFieldGroup
                v-if="showSectionFilter"
                size="xs"
              >
                <UButton
                  color="neutral"
                  :variant="activeSectionId === 'all' ? 'solid' : 'ghost'"
                  @click="setActiveSection('all')"
                >
                  All sections
                </UButton>
                <UButton
                  v-for="section in availableSectionFilters"
                  :key="section.id"
                  color="neutral"
                  :variant="activeSectionId === section.id ? 'solid' : 'ghost'"
                  @click="setActiveSection(section.id)"
                >
                  {{
                    filterButtonLabel(
                      section.sectionLabel || section.label,
                      section.count
                    )
                  }}
                </UButton>
              </UFieldGroup>
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
            : 'No dishes found for this filter.'
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
import { useDishInterface, type Dish } from '../../../composables/fireux/firestore/dish/useDish'

type DishCollectionSection = {
  id: string
  label: string
  dishIds: string[]
  count?: number
  menuId?: string
  sectionId?: string
  sectionLabel?: string
}

const props = withDefaults(
  defineProps<{
    collection?: Dish[]
    sections?: DishCollectionSection[]
    menuFilters?: DishCollectionSection[]
    sectionFilters?: DishCollectionSection[]
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
const activeSectionId = ref('all')
const activeMenuId = ref('all')
const menuFilters = computed(() => props.menuFilters ?? props.sections ?? [])
const sectionFilters = computed(() => props.sectionFilters ?? [])
const showMenuFilter = computed(() => menuFilters.value.length > 0)
const availableSectionFilters = computed(() => {
  if (activeMenuId.value === 'all') return sectionFilters.value

  return sectionFilters.value.filter((section) => section.menuId === activeMenuId.value)
})
const showSectionFilter = computed(
  () => activeMenuId.value !== 'all' && availableSectionFilters.value.length > 0
)
const showFilters = computed(() => showMenuFilter.value || showSectionFilter.value)

watch(
  menuFilters,
  (nextMenus) => {
    if (activeMenuId.value === 'all') return
    if (nextMenus.some((menu) => menu.id === activeMenuId.value)) return
    activeMenuId.value = 'all'
  },
  { immediate: true }
)

watch(
  availableSectionFilters,
  (nextSections) => {
    if (activeSectionId.value === 'all') return
    if (nextSections.some((section) => section.id === activeSectionId.value)) return
    activeSectionId.value = 'all'
  },
  { immediate: true }
)

const activeMenu = computed(() =>
  menuFilters.value.find((menu) => menu.id === activeMenuId.value) ?? null
)
const activeSection = computed(() =>
  availableSectionFilters.value.find((section) => section.id === activeSectionId.value) ?? null
)

const filterButtonLabel = (label: string, count?: number) => {
  const suffix = typeof count === 'number' ? ` (${count})` : ''
  return `${label}${suffix}`
}

const setActiveMenu = (menuId: string) => {
  activeMenuId.value = String(menuId || 'all').trim() || 'all'
  activeSectionId.value = 'all'
}

const setActiveSection = (sectionId: string) => {
  activeSectionId.value = String(sectionId || 'all').trim() || 'all'
}

const filterDishIds = (source: DishCollectionSection | null) =>
  new Set(
    (source?.dishIds ?? [])
      .map((dishId) => String(dishId || '').trim())
      .filter(Boolean)
  )

const collectionFilteredByPlacement = computed(() => {
  const menuDishIds = filterDishIds(activeMenu.value)
  const sectionDishIds = filterDishIds(activeSection.value)
  const orderSource = activeSection.value || activeMenu.value
  const order = new Map(
    (orderSource?.dishIds ?? []).map((dishId, index) => [
      String(dishId || '').trim(),
      index,
    ])
  )
  const filtered = collection.value.filter((dish) => {
    const dishId = String(dish?.id ?? '').trim()
    if (menuDishIds.size && !menuDishIds.has(dishId)) return false
    if (sectionDishIds.size && !sectionDishIds.has(dishId)) return false
    return true
  })

  return filtered.sort(
    (a, b) =>
      (order.get(String(a?.id ?? '').trim()) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(String(b?.id ?? '').trim()) ?? Number.MAX_SAFE_INTEGER)
  )
})

const fullCollectionCount = computed(() => collection.value.length)
const totalCount = computed(() => collectionFilteredByPlacement.value.length)
const showSearchInput = computed(
  () => showSearch.value && fullCollectionCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Dish, NonNullable<ReturnType<typeof makeCard>>>({
    items: collectionFilteredByPlacement,
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
