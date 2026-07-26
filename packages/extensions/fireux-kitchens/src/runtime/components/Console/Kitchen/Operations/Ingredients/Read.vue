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
            <ConsoleKitchenOperationsIngredientsCardsCell
              v-for="card in group.cards"
              :key="card.id"
              :id="card.id"
              :to="card.to"
              :title="card.title"
              :image-url="card.imageUrl"
              :icon="group.icon"
            />
          </div>
        </section>
      </div>

      <p v-else class="text-sm text-dimmed">No ingredients found.</p>
    </section>

    <DevFireuxDebugPanel
      :title="debugTitle"
      scope="console"
      :data="pageDebug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIngredientInterface } from '../../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'
import { useKitchenIngredientsWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenIngredientsWorkspace'
import {
  INGREDIENT_CATEGORY_OPTIONS,
  type IngredientCategory,
} from '../../../../../models/ingredient-taxonomy'

const { ingredients, kitchenName, pending, loadError, debug } =
  useKitchenIngredientsWorkspace()
const { pill } = useIngredientInterface()
const categoryIds = new Set<IngredientCategory>(
  INGREDIENT_CATEGORY_OPTIONS.map((option) => option.value)
)
const resolveCategory = (value: unknown): IngredientCategory => {
  const category = String(value ?? '').trim() as IngredientCategory
  return categoryIds.has(category) ? category : 'other'
}

type IngredientFoodGroup =
  | 'fruit'
  | 'vegetables'
  | 'raw-meat-poultry'
  | 'prepared-meat'
  | 'seafood'
  | 'dairy-eggs'
  | 'bakery'
  | 'herbs-spices'
  | 'sauces-condiments'
  | 'pantry'
  | 'prepared-foods'
  | 'other'

type IngredientFoodGroupOption = {
  value: IngredientFoodGroup
  label: string
  icon: string
}

const INGREDIENT_FOOD_GROUP_OPTIONS: readonly IngredientFoodGroupOption[] = [
  { value: 'fruit', label: 'Fruit', icon: 'i-lucide-apple' },
  { value: 'vegetables', label: 'Vegetables', icon: 'i-lucide-carrot' },
  {
    value: 'raw-meat-poultry',
    label: 'Raw meat & poultry',
    icon: 'i-lucide-beef',
  },
  { value: 'prepared-meat', label: 'Prepared meat', icon: 'i-lucide-ham' },
  { value: 'seafood', label: 'Seafood', icon: 'i-lucide-fish' },
  { value: 'dairy-eggs', label: 'Dairy & eggs', icon: 'i-lucide-milk' },
  { value: 'bakery', label: 'Bakery', icon: 'i-lucide-wheat' },
  {
    value: 'herbs-spices',
    label: 'Herbs & spices',
    icon: 'i-lucide-leaf',
  },
  {
    value: 'sauces-condiments',
    label: 'Sauces & condiments',
    icon: 'i-lucide-cooking-pot',
  },
  { value: 'pantry', label: 'Pantry', icon: 'i-lucide-package' },
  {
    value: 'prepared-foods',
    label: 'Prepared foods',
    icon: 'i-lucide-chef-hat',
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'i-lucide-circle-ellipsis',
  },
]

const fruitIngredientIds = new Set([
  'cherries',
  'lemon',
  'lime',
  'strawberries',
])

const resolveFoodGroup = ({
  id,
  category,
  kind,
}: {
  id: string
  category: IngredientCategory
  kind: string
}): IngredientFoodGroup => {
  if (category === 'produce') {
    return fruitIngredientIds.has(id) ? 'fruit' : 'vegetables'
  }

  if (category === 'meat-poultry') {
    return kind === 'prepared' || kind === 'composite'
      ? 'prepared-meat'
      : 'raw-meat-poultry'
  }

  if (category === 'prepared') return 'prepared-foods'
  return category
}

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
        foodGroup: resolveFoodGroup({
          id: ingredientId,
          category: resolveCategory(ingredient.category),
          kind: String(ingredient.kind ?? '').trim(),
        }),
        to: `/console/kitchen/ingredients/${encodeURIComponent(ingredientId)}`,
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
