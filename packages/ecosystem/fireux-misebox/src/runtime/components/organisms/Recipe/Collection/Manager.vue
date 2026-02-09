<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Recipes</div>
          <p>Browse recipes available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search recipes…"
          />

          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <RecipeCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <RecipeCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <RecipeCardsCell v-bind="card" />
        </NuxtLink>
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
import { computed } from 'vue';
import type { Recipe } from '../../../../../models/Recipe.model';
import { useRecipeInterface } from '../../../../composables/fireux/firestore/recipe/utils/view/useRecipeInterface';

const props = defineProps<{ collection?: Recipe[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useRecipeInterface()

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
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev

</script>
