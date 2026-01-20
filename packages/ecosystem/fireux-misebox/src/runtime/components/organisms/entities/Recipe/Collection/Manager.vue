<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Recipes</div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No recipes yet.
    </div>

    <div v-else>
      <div
        v-if="variant === 'pill'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <component
          :is="wrapperFor(card)"
          v-for="card in cards"
          :key="card.id"
          v-bind="wrapperPropsFor(card)"
          class="block"
        >
          <RecipeCardsPill v-bind="card" />
        </component>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <component
          :is="wrapperFor(card)"
          v-for="card in cards"
          :key="card.id"
          v-bind="wrapperPropsFor(card)"
          class="block"
        >
          <RecipeCardsCell v-bind="card" />
        </component>
      </div>
    </div>

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Recipes (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRecipeInterface } from '../../../../../composables/fireux/firestore/objects/recipe/utils/view/useRecipeInterface';
import type { Recipe } from '../../../../../models/objects/Recipe.model';

const props = defineProps<{ collection?: Recipe[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useRecipeInterface()
type RecipeCardShape = NonNullable<ReturnType<typeof makeCard>>
const cards = computed(() =>
  collection.value
    .map((recipe) => makeCard(recipe))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalRecipes: collection.value.length,
  recipes: collection.value,
}))

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const wrapperFor = (card: RecipeCardShape) => (card.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: RecipeCardShape) => (card.to ? { to: card.to } : {})
</script>
