<template>
  <div class="space-y-6">
    <UAlert
      v-if="loadError"
      color="error"
      variant="soft"
      title="Ingredient details could not be loaded"
      description="The Kitchen links are still intact, but their shared Ingredient details are temporarily unavailable."
    />

    <UAlert
      v-else-if="pending"
      color="neutral"
      variant="soft"
      title="Loading Ingredient details"
    />

    <section v-else aria-label="Ingredients" class="space-y-6">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">Ingredients</h2>
          <p class="text-sm text-dimmed">{{ collectionDescription }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="neutral" variant="soft">
            {{ cards.length }} ingredients
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ foodGroups.length }} food groups
          </UBadge>
        </div>
      </div>

      <div v-if="foodGroups.length" class="space-y-6">
        <section
          v-for="group in foodGroups"
          :key="group.value"
          :aria-labelledby="`ingredient-food-group-${group.value}`"
          class="space-y-3"
        >
          <div class="flex min-w-0 items-center gap-2">
            <UIcon
              :name="group.icon"
              class="size-4 shrink-0 text-muted"
              aria-hidden="true"
            />
            <h3
              :id="`ingredient-food-group-${group.value}`"
              class="truncate text-sm font-semibold text-highlighted"
            >
              {{ group.label }}
            </h3>
            <UBadge color="neutral" variant="soft" size="xs">
              {{ group.cards.length }}
            </UBadge>
          </div>

          <div class="flex flex-wrap gap-3">
            <WorkspaceKitchenIngredientsCardsCell
              v-for="card in group.cards"
              :key="card.id"
              :id="card.id"
              :to="card.to"
              :title="card.title"
              :image-url="card.imageUrl"
              :icon="group.icon"
              :data-service-state="card.inService ? 'active' : 'inactive'"
              :class="card.inService ? '' : 'opacity-45 saturate-50'"
            />
          </div>
        </section>
      </div>

      <p v-else class="text-sm text-dimmed">No ingredients found.</p>
    </section>

    <DevDebugPanel
      :title="debugTitle"
      scope="workspace"
      object-origin="fetched"
      :objects="{ ingredients }"
      :derived="pageDebug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIngredientInterface } from '../../../../ingredient/composables/useIngredientInterface'
import { useKitchenIngredientsWorkspace } from '../../../composables/workspace/Ingredients/useKitchenIngredientsWorkspace'
import {
  INGREDIENT_FOOD_GROUP_OPTIONS,
  resolveIngredientFoodGroup,
  type IngredientFoodGroup,
} from '../../../../ingredient/models/ingredient-food-group'

const {
  ingredients,
  kitchenName,
  pending,
  loadError,
  isIngredientInService,
  debug,
} = useKitchenIngredientsWorkspace()
const { pill } = useIngredientInterface()

const debugTitle = computed(() =>
  kitchenName.value
    ? `Ingredients used in ${kitchenName.value}`
    : 'Kitchen ingredients'
)
const collectionDescription = computed(() =>
  kitchenName.value
    ? `Ingredients used in ${kitchenName.value}, grouped by food group.`
    : 'Ingredients for the selected Kitchen, grouped by food group.'
)
type KitchenIngredientPill = NonNullable<ReturnType<typeof pill>> & {
  foodGroup: IngredientFoodGroup
  inService: boolean
}
type IngredientFoodGroupSection = {
  value: IngredientFoodGroup
  label: string
  icon: string
  cards: KitchenIngredientPill[]
}
const cards = computed<KitchenIngredientPill[]>(() =>
  ingredients.value.flatMap((ingredient) => {
    const card = pill(ingredient)
    const ingredientId = String(
      ingredient.ingredient_id || ingredient.id || ''
    ).trim()
    if (!card || !ingredientId) return []

    return [
      {
        ...card,
        inService: isIngredientInService(ingredientId),
        foodGroup: resolveIngredientFoodGroup({
          id: ingredientId,
          category: ingredient.category,
          kind: ingredient.kind,
        }),
        to: `/workspace/kitchen/ingredients/${encodeURIComponent(ingredientId)}`,
      },
    ]
  })
)
const foodGroups = computed<IngredientFoodGroupSection[]>(() =>
  INGREDIENT_FOOD_GROUP_OPTIONS.flatMap((option) => {
    const foodGroupCards = cards.value
      .filter((card) => card.foodGroup === option.value)
      .sort((left, right) =>
        left.title.localeCompare(right.title, undefined, {
          sensitivity: 'base',
        })
      )
    if (!foodGroupCards.length) return []

    return [
      {
        ...option,
        cards: foodGroupCards,
      },
    ]
  })
)
const pageDebug = computed(() => ({
  ...debug.value,
  presentation: {
    groupedBy: 'food-group',
    foodGroupCount: foodGroups.value.length,
    ingredientCountsByFoodGroup: Object.fromEntries(
      foodGroups.value.map((group) => [group.value, group.cards.length])
    ),
  },
}))
</script>
