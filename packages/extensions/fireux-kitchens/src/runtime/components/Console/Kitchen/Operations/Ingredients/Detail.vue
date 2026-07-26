<template>
  <div class="space-y-6">
    <div class="flex flex-wrap gap-2">
      <UButton
        to="/console/kitchen/ingredients"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to kitchen ingredients
      </UButton>

      <UButton
        v-if="rootIngredientPath"
        :to="rootIngredientPath"
        color="neutral"
        variant="soft"
        icon="i-lucide-library"
        size="sm"
      >
        View root ingredient
      </UButton>
    </div>

    <UAlert
      v-if="loadError"
      color="error"
      variant="soft"
      title="Ingredient details could not be loaded"
      description="The Kitchen link is still intact, but its shared Ingredient details are temporarily unavailable."
    />

    <UAlert
      v-else-if="pending"
      color="neutral"
      variant="soft"
      title="Loading ingredient"
      description="Fetching the selected Kitchen Ingredient and its shared identity."
    />

    <IngredientProfile v-else-if="profile" :model="profile" />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Ingredient not found"
      :description="`No ingredient was found for ${ingredientId || 'this route'}.`"
    />

    <DevFireuxDebugPanel
      title="Kitchen ingredient detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleIngredient } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenConsoleIngredient'
import { useIngredientInterface } from '../../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'
import IngredientProfile from '../../../../Ingredient/Cards/Profile.vue'

const { profile: makeProfile } = useIngredientInterface()
const {
  ingredient,
  ingredientId,
  pending,
  loadError,
  debug,
} = useKitchenConsoleIngredient()
const profile = computed(() => makeProfile(ingredient.value))
const rootIngredientPath = computed(() => {
  const id = String(
    ingredient.value?.ingredient_id ||
    ingredient.value?.id ||
    ingredientId.value ||
    ''
  ).trim()

  return id ? `/ingredients/${encodeURIComponent(id)}` : ''
})
</script>
