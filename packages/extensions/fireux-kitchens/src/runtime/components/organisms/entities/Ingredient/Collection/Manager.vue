<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Ingredients</div>
          <p>Browse global ingredients available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search ingredients..."
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

    <OrganismsEntitiesIngredientCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <IngredientCardsPill v-bind="card" />
      </template>
      <template #cell="{ card }">
        <IngredientCardsCell v-bind="card" :prop="card.description" />
      </template>
    </OrganismsEntitiesIngredientCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No ingredients match your search.' : 'No ingredients found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        title="Ingredients (JSON)"
        context="Ingredients collection manager · global runtime collection"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useIngredientInterface } from '../../../../../composables/fireux/firestore/objects/ingredient/utils/view/useIngredientInterface'
import type { Ingredient } from '../../../../../models/objects/ingredient.model'

const props = defineProps<{
  collection?: Ingredient[]
}>()

const { card: makeCard, searchText } = useIngredientInterface()

const collection = computed(() => props.collection ?? [])
const totalCount = computed(() => collection.value.length)

const sortedCollection = computed(() =>
  [...collection.value].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
)

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Ingredient, ReturnType<typeof makeCard>>({
  items: sortedCollection,
  searchText: (ingredient: Ingredient) => searchText(ingredient),
  makeCard: (ingredient: Ingredient) => makeCard(ingredient),
})

const isDev = import.meta.dev
</script>
