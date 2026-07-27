<template>
  <div class="mt-5" aria-label="Ingredients preview">
    <div v-if="ingredients.length">
      <div class="mb-3 flex flex-wrap justify-end gap-2">
        <UBadge color="neutral" variant="outline" size="sm">
          {{ ingredients.length }} ingredients
        </UBadge>
      </div>

      <UAccordion
        type="multiple"
        :items="ingredientGroups"
        :default-value="defaultOpenFoodGroups"
        :unmount-on-hide="false"
        class="max-h-[24rem] overflow-y-auto pr-1"
        :ui="{
          trigger: 'py-2',
          body: 'pb-3',
        }"
      >
        <template #default="{ item }">
          <div class="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span class="truncate text-sm font-semibold">{{ item.label }}</span>
            <UBadge color="neutral" variant="soft" size="xs">
              {{ item.ingredients.length }}
            </UBadge>
          </div>
        </template>

        <template #body="{ item }">
          <div
            :data-food-group="item.value"
            class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
          >
            <article
              v-for="ingredient in item.ingredients"
              :key="ingredient.id"
              :data-ingredient-id="ingredient.id"
              class="min-w-0 overflow-hidden rounded-xl border border-default bg-default shadow-sm"
            >
              <img
                :src="ingredient.imageUrl"
                :alt="ingredient.name"
                class="aspect-square w-full object-cover"
                loading="lazy"
                width="160"
                height="160"
              >
              <div class="border-t border-default px-2.5 py-2">
                <p class="truncate text-xs font-semibold text-highlighted">
                  {{ ingredient.name }}
                </p>
              </div>
            </article>
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
  INGREDIENT_FOOD_GROUP_OPTIONS,
  type IngredientFoodGroup,
} from 'fireux-kitchens/runtime/models/ingredient-food-group'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoIngredient =
  MiseboxProductDemo['console']['ingredients'][number]

type ProductDemoIngredientGroup = {
  value: IngredientFoodGroup
  label: string
  icon: string
  ingredients: ProductDemoIngredient[]
}

const props = defineProps<{
  ingredients: ProductDemoIngredient[]
  error: boolean
}>()

const ingredientGroups = computed<ProductDemoIngredientGroup[]>(() =>
  INGREDIENT_FOOD_GROUP_OPTIONS.flatMap((option) => {
    const ingredients = props.ingredients.filter(
      ingredient => ingredient.foodGroup === option.value
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
