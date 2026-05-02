<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ props.title }}</h2>
          <p>{{ props.description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
          <div class="ml-auto flex items-center gap-2">
            <UInput
              v-if="showSearchInput"
              v-model="query"
              size="xs"
              :placeholder="props.searchPlaceholder"
            />

            <UButton
              v-if="props.showVariantToggle"
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

            <UBadge v-if="props.showCount" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <OrganismsMenuCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <OrganismsMenuCardsPill v-bind="card" :link="props.link" />
      </template>

      <template #cell="{ card }">
        <OrganismsMenuCardsCell v-bind="card" :link="props.link" />
      </template>
    </OrganismsMenuCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No menus match your search.' : 'No menus found.' }}
    </p>

    <DevJson
      v-if="isDev"
      :title="'Menus (JSON)'"
      context="collection manager · menus"
      :data="devJsonData"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { useMenuInterface } from '../../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface'
import type { Dish } from '../../../../models/dish.model'
import type { Menu } from '../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    collection?: Menu[]
    dishes?: Dish[]
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
    dishes: () => [],
    title: 'Menus',
    description: 'Browse menus for this kitchen.',
    searchPlaceholder: 'Search menus...',
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
} = useMenuInterface()

const collection = computed(() =>
  [...(props.collection ?? [])].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.name || '').localeCompare(String(b.name || ''))
  )
)

const dishesById = computed(() => {
  const lookup = new Map<string, Dish>()

  props.dishes.forEach((dish) => {
    const id = String(dish?.id ?? '').trim()
    if (id) lookup.set(id, dish)
  })

  return lookup
})

const menuImageUrl = (menu: Menu) => {
  const items = (menu.sections ?? []).flatMap((section) => section.items ?? [])

  for (const item of items) {
    const dishId = String(item?.dish_id ?? '').trim()
    const imageUrl = String(dishesById.value.get(dishId)?.image_url ?? '').trim()
    if (imageUrl) return imageUrl
  }

  return ''
}

const { devJsonData } = useDevCollectionJson(collection)

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => props.showSearch && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Menu, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (menu) => makeCard(menu),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((menu) => {
      if (variant.value === 'cell') {
        const base = makeCard(menu)
        const cell = makeCell(menu)
        if (!base || !cell) return null
        return {
          ...base,
          ...cell,
          imageUrl: menuImageUrl(menu) || base.imageUrl,
        }
      }

      const pill = makePill(menu)
      return pill
        ? { ...pill, imageUrl: menuImageUrl(menu) || pill.imageUrl }
        : null
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
