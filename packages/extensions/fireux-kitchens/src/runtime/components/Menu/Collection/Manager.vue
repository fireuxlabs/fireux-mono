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

    <MenuCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <!-- Collection manager spine: docs/concepts/collection-manager.md. Keep aligned with App/Collection/Manager.vue and Kitchen/Collection/Manager.vue. -->
      <template #pill="{ card }">
        <MenuCardsPill v-bind="card" :link="linkEnabled" />
      </template>

      <template #cell="{ card }">
        <MenuCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </MenuCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No menus match your search.' : 'No menus found.' }}
    </p>

    <DevJson
      :title="'Menus (JSON)'"
      context="collection manager · menus"
      :objects="devObjects"
      :derived="devDerived"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import {
  useMenuInterface,
  type MenuInterfaceSource,
} from '../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'
import { useMenuCollection } from '../../../composables/fireux/firestore/menu/fetch/useMenuCollection'

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
  }>(),
  {
    title: 'Live menus',
    description: 'Open a menu, browse dishes, or start an order from kitchens using Misebox.',
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
const menuCollection = useMenuCollection()
// Card handoff spine: pass v-bind="card" plus linkEnabled, matching sibling collection managers.
const linkEnabled = computed(() => props.link !== false)

const collection = computed(() =>
  menuCollection.menus.value
)

const { devJsonData } = useDevCollectionJson(collection)

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => props.showSearch && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<MenuInterfaceSource, NonNullable<ReturnType<typeof makeCard>>>({
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
        return { ...base, ...cell }
      }

      const pill = makePill(menu)
      return pill
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

const devObjects = computed(() => ({
  // Debug spine: keep root doorway objects separate from interface-derived cards.
  menus: devJsonData.value,
}))

const devDerived = computed(() => ({
  family: 'Root Simple Collection Manager',
  source: {
    rootPath: 'menus',
    hydration:
      'None here. Menu detail/manifest resolves kitchen, app, ordering, and theme context.',
  },
  controls: {
    query: query.value,
    variant: variant.value,
    linkEnabled: linkEnabled.value,
    showSearchInput: showSearchInput.value,
  },
  counts: {
    total: totalCount.value,
    visible: visibleCount.value,
  },
  cards: cardsFiltered.value.map((card) => ({
    id: card.id,
    to: card.to,
    title: card.title,
    subtitle: card.subtitle,
    meta: card.meta,
    description: card.description,
    active: card.active,
  })),
}))
</script>
