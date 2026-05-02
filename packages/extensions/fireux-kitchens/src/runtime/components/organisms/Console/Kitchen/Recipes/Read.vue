<template>
  <div class="space-y-6">
    <RecipeCollectionManager
      :collection="recipes"
      title="Recipes"
      description="Browse recipes for the selected kitchen."
      :link="true"
    />

    <RecipeConsoleCore
      :collection="recipes"
      :dish-usage-by-recipe-id="dishUsageByRecipeId"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen recipes"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipes'
import RecipeCollectionManager from '../../../Recipe/Collection/Manager.vue'
import RecipeConsoleCore from '../../../Recipe/Console/Core.vue'

const { recipes, dishUsageByRecipeId, debug } = useKitchenConsoleRecipes()
const isDev = import.meta.dev
</script>
