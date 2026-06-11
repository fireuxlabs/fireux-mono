<template>
  <div class="space-y-6">
    <RecipeCollectionManager
      :collection="recipes"
      title="Recipes"
      description="Browse recipes for the selected kitchen."
      :link="true"
    />

    <DevFireuxDebugPanel
      title="Kitchen recipes"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/console/kitchen/operations/Recipes/useKitchenConsoleRecipes'
import RecipeCollectionManager from '../../../../Recipe/Collection/Manager.vue'

const { recipes, debug } = useKitchenConsoleRecipes()
</script>
