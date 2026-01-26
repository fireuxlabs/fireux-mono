<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Ingredients</div>
          <p>Browse ingredients available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search ingredients…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
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
        <NuxtLink :to="card.to">
          <IngredientCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <IngredientCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsEntitiesIngredientCollectionList>

    <p v-else>
      {{ query ? 'No ingredients match your search.' : 'No ingredients found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Ingredients (JSON)'"
        context="collection manager · ingredients"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useIngredientInterface } from '../../../../../composables/fireux/firestore/objects/ingredient/utils/view/useIngredientInterface';
import type { Ingredient } from '../../../../../models/objects/Ingredient.model';

const props = defineProps<{ collection?: Ingredient[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useIngredientInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Ingredient, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (ingredient: Ingredient) => searchText(ingredient),
  makeCard: (ingredient: Ingredient) => makeCard(ingredient),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev

</script>
