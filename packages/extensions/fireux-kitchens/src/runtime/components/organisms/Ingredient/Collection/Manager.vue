<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
          <div class="flex items-center gap-2">
            <slot name="controls" />
          </div>
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
              :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
              :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
              @click="toggleVariant"
            />
            <UBadge v-if="showCount" variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
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
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block cursor-pointer"
          @click="linkEnabled ? undefined : handleSelect(card.id)"
        >
          <IngredientCardsPill
            v-bind="card"
            :show-slug="showSlug"
            :warning="warningByIngredientId[card.id]"
          />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block cursor-pointer"
          @click="linkEnabled ? undefined : handleSelect(card.id)"
        >
          <IngredientCardsCell
            v-bind="card"
            :show-slug="showSlug"
            :warning="warningByIngredientId[card.id]"
          />
        </NuxtLink>
      </template>
    </IngredientCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No ingredients match your search.' : 'No ingredients found.' }}
    </p>

    <div v-if="isDev">
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
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import {
  useIngredientInterface,
  type IngredientInterfaceItem,
} from '../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface';
import type { Ingredient } from '../../../../models/ingredient.model';

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
    warningByIngredientId?: Record<string, string>
    showSlug?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Ingredients',
    description: 'Browse global ingredients available to this runtime.',
    link: true,
    showSlug: false,
    searchPlaceholder: 'Search ingredients...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const emit = defineEmits<{
  (event: 'select', ingredient: Ingredient): void
}>()

const { card: makeCard, searchText } = useIngredientInterface()

const collection = computed(() => props.collection ?? [])
const showSlug = computed(() => props.showSlug === true)
const warningByIngredientId = computed(() => props.warningByIngredientId ?? {})
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search ingredients...'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)

const ingredientById = computed(() => {
  const map = new Map<string, IngredientInterfaceItem>()
  for (const ingredient of collection.value) {
    const id = String(ingredient.id || '').trim()
    if (!id) continue
    map.set(id, ingredient)
  }
  return map
})

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<IngredientInterfaceItem, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (ingredient: IngredientInterfaceItem) => searchText(ingredient),
  makeCard: (ingredient: IngredientInterfaceItem) => makeCard(ingredient),
  initialVariant: props.initialVariant,
})

const isDev = import.meta.dev

const devJsonTitle = computed(() => props.devJsonTitle || 'Ingredients (JSON)')
const devJsonContext = computed(
  () => props.devJsonContext || 'collection manager · ingredients'
)
const devJsonData = computed(() => props.devJsonData ?? collection.value)
const devJsonDefaultOpen = computed(() => props.devJsonDefaultOpen ?? false)
const devJsonHideWhenEmpty = computed(() => props.devJsonHideWhenEmpty ?? true)

const handleSelect = (id: string) => {
  const ingredient = ingredientById.value.get(String(id || '').trim())
  if (ingredient) emit('select', ingredient as Ingredient)
}
</script>
