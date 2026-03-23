<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
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

    <RecipeCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <RecipeCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <RecipeCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </RecipeCollectionList>

    <p v-else>
      {{ query ? 'No recipes match your search.' : 'No recipes found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Recipes (JSON)'"
        context="collection manager · recipes"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import type { Recipe } from 'fireux-kitchens/runtime/models/recipe.model';
import { computed } from 'vue';
import { useRecipeInterface } from '../../../../composables/fireux/firestore/recipe/utils/view/useRecipeInterface';

const props = withDefaults(
  defineProps<{
    collection?: Recipe[]
    title?: string
    description?: string
    link?: boolean
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Recipes',
    description: 'Browse recipe records available to this runtime.',
    link: true,
    searchPlaceholder: 'Search recipes…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Recipes'))
const description = computed(
  () => String(props.description || 'Browse recipe records available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search recipes…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const { interface: makeCard, searchText } = useRecipeInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Recipe, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (recipe: Recipe) => searchText(recipe),
  makeCard: (recipe: Recipe) => makeCard(recipe),
  initialVariant: props.initialVariant,
})

const isDev = import.meta.dev

</script>
