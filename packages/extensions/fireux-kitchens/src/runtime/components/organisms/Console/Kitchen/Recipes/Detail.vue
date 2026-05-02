<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/recipes"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to recipes
    </UButton>

    <RecipeProfile
      v-if="recipe"
      :recipe="recipe"
      :dish-usage="dishUsage"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading recipe' : 'Recipe not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen recipe.'
          : `No recipe was found for ${recipeId || 'this route'}.`
      "
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen recipe detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipe } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipe'
import RecipeProfile from '../../../Recipe/Cards/Profile.vue'

const { recipe, recipeId, dishUsage, pending, debug } = useKitchenConsoleRecipe()
const isDev = import.meta.dev
</script>
