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

    <IngredientCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <IngredientCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <IngredientCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </IngredientCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{
        query ? 'No ingredients match your search.' : 'No ingredients found.'
      }}
    </p>

    <div>
      <DevJson
        :title="devJsonTitle"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="devJsonDefaultOpen"
        :hide-when-empty="devJsonHideWhenEmpty"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionRouteContext } from 'fireux-core/runtime/composables/shared/useCollectionRouteContext'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useIngredientCollection } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientCollection'
import {
  useIngredientInterface,
  type IngredientInterfaceItem,
} from '../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

const props = withDefaults(
  defineProps<{
    collection?: IngredientInterfaceItem[]
    title?: string
    description?: string
    link?: boolean
    devJsonTitle?: string
    devJsonContext?: string
    devJsonData?: unknown
    devJsonDefaultOpen?: boolean
    devJsonHideWhenEmpty?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    collectionKey?: string
    baseRoute?: string
    resolveTo?: (id: string) => string
  }>(),
  {
    title: 'Ingredients',
    description: 'Browse global ingredients available to this runtime.',
    link: true,
    searchPlaceholder: 'Search ingredients...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    collectionKey: 'ingredients',
  }
)

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useIngredientInterface()

const fetched = useIngredientCollection()
const collection = computed<IngredientInterfaceItem[]>(() =>
  Array.isArray(props.collection)
    ? props.collection
    : fetched.ingredients.value
)
const { resolveTo } = useCollectionRouteContext({
  collectionKey: computed(() => props.collectionKey),
  baseRoute: computed(() => props.baseRoute),
  resolveTo: computed(() => props.resolveTo),
})
const withIngredientRoute = <T extends { id: string; to: string } | null>(
  card: T
): T => {
  if (!card) return card
  return { ...card, to: resolveTo(card.id) } as T
}
const sourceDevJsonCollection = computed(() =>
  Array.isArray(props.devJsonData)
    ? (props.devJsonData as IngredientInterfaceItem[])
    : collection.value
)
const { devJsonData: augmentedDevJsonData } = useDevCollectionJson(
  sourceDevJsonCollection
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search ingredients...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    IngredientInterfaceItem,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (ingredient: IngredientInterfaceItem) =>
      withIngredientRoute(makeCard(ingredient)),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((ingredient) => {
      if (variant.value === 'cell') {
        const base = makeCard(ingredient)
        const cell = makeCell(ingredient)
        if (!base || !cell) return null
        return withIngredientRoute({ ...base, ...cell })
      }

      return withIngredientRoute(makePill(ingredient))
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

const devJsonTitle = computed(() => props.devJsonTitle || 'Ingredients (JSON)')
const devJsonContext = computed(
  () => props.devJsonContext || 'collection manager · ingredients'
)
const devJsonData = computed(
  () => props.devJsonData ?? augmentedDevJsonData.value
)
const devJsonDefaultOpen = computed(() => props.devJsonDefaultOpen ?? false)
const devJsonHideWhenEmpty = computed(() => props.devJsonHideWhenEmpty ?? true)
</script>
