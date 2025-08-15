<template>
  <div>
    <div>
      <h1>{{ kitchen?.name || 'Kitchen' }}</h1>
      <p>Manage ingredients for this kitchen</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Available Global Ingredients -->
      <div>
        <h2>Available Ingredients</h2>
        <p class="text-gray-600 mb-4">Click to add to your kitchen</p>
        <div>
          <UCard
            v-for="ingredient in availableIngredients"
            :key="ingredient.id"
            class="mb-2 cursor-pointer hover:bg-gray-50"
            @click="addToKitchen(ingredient.id)"
          >
            <div class="flex justify-between items-center">
              <span>{{ ingredient.name }}</span>
              <UButton
                icon="i-heroicons-plus"
                size="sm"
                variant="soft"
                color="green"
              >
                Add
              </UButton>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Kitchen Ingredients -->
      <div>
        <h2>Kitchen Ingredients</h2>
        <p class="text-gray-600 mb-4">Click to remove from your kitchen</p>
        <div>
          <UCard
            v-for="ingredient in kitchenIngredients"
            :key="ingredient.id"
            class="mb-2 cursor-pointer hover:bg-red-50"
            @click="removeFromKitchen(ingredient.id)"
          >
            <div class="flex justify-between items-center">
              <span>{{ ingredient.name }}</span>
              <UButton
                icon="i-heroicons-minus"
                size="sm"
                variant="soft"
                color="red"
              >
                Remove
              </UButton>
            </div>
          </UCard>

          <div
            v-if="kitchenIngredients.length === 0"
            class="text-center py-8 text-gray-500"
          >
            No ingredients in this kitchen yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useKitchens } from '../../composables/firestore/objects/Kitchen/useKitchens'
import { useIngredient } from '../../composables/firestore/objects/ingredients/useIngredient'

const route = useRoute()
const kitchenId = route.params.id as string

const {
  getById: getKitchenById,
  addIngredient,
  removeIngredient,
} = useKitchens()
const { all: allIngredients } = useIngredient()

const kitchen = getKitchenById(kitchenId)

// Ingredients available to add (not already in kitchen)
const availableIngredients = computed(() => {
  if (!allIngredients.value || !kitchen.value) return []
  return allIngredients.value.filter(
    (ingredient) => !kitchen.value!.ingredients.includes(ingredient.id)
  )
})

// Ingredients currently in the kitchen
const kitchenIngredients = computed(() => {
  if (!allIngredients.value || !kitchen.value) return []
  return allIngredients.value.filter((ingredient) =>
    kitchen.value!.ingredients.includes(ingredient.id)
  )
})

// Add ingredient to kitchen
const addToKitchen = async (ingredientId: string) => {
  await addIngredient(kitchenId, ingredientId)
}

// Remove ingredient from kitchen
const removeFromKitchen = async (ingredientId: string) => {
  await removeIngredient(kitchenId, ingredientId)
}
</script>
