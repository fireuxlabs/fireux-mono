<template>
  <div aria-label="Ingredients preview">
    <div v-if="ingredients.length">
      <div>
        <UBadge color="neutral" variant="outline" size="sm">
          {{ ingredients.length }} ingredients
        </UBadge>
      </div>

      <UAccordion
        type="multiple"
        :items="ingredientGroups"
        :default-value="defaultOpenFoodGroups"
        :unmount-on-hide="false"
      >
        <template #default="{ item }">
          <div>
            <span>{{ item.label }}</span>
            <UBadge color="neutral" variant="soft" size="xs">
              {{ item.ingredients.length }}
            </UBadge>
          </div>
        </template>

        <template #body="{ item }">
          <div :data-food-group="item.value" class="pagebody">
            <UCard
              as="article"
              v-for="ingredient in item.ingredients"
              :key="ingredient.id"
              :data-ingredient-id="ingredient.id"
            >
              <img
                :src="ingredient.imageUrl"
                :alt="ingredient.name"
                loading="lazy"
                width="160"
                height="160"
              />
              <div>
                <p class="fx-type-caption">
                  {{ ingredient.name }}
                </p>
              </div>
            </UCard>
          </div>
        </template>
      </UAccordion>
    </div>

    <UAlert
      v-else-if="error"
      color="neutral"
      variant="soft"
      title="Ingredient preview unavailable"
      description="The shared Ingredient catalogue could not be loaded."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  INGREDIENT_CATEGORY_OPTIONS,
  type IngredientCategory,
} from 'fireux-kitchens/runtime/ingredient/models/ingredient-taxonomy'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoIngredient =
  MiseboxProductDemo['workspace']['ingredients'][number]

type ProductDemoIngredientGroup = {
  value: IngredientCategory
  label: string
  icon: string
  ingredients: ProductDemoIngredient[]
}

const props = defineProps<{
  ingredients: ProductDemoIngredient[]
  error: boolean
}>()

const ingredientGroups = computed<ProductDemoIngredientGroup[]>(() =>
  INGREDIENT_CATEGORY_OPTIONS.flatMap((option) => {
    const ingredients = props.ingredients.filter(
      (ingredient) => ingredient.foodGroup === option.value
    )
    if (!ingredients.length) return []

    return [
      {
        ...option,
        ingredients,
      },
    ]
  })
)
const defaultOpenFoodGroups = computed(() =>
  ingredientGroups.value[0] ? [ingredientGroups.value[0].value] : []
)
</script>
