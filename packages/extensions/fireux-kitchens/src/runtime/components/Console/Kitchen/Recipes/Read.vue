<template>
  <div class="space-y-6">
    <RecipeCollectionManager
      :collection="recipes"
      title="Recipes"
      description="Browse recipes for the selected kitchen."
      :link="true"
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
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleRecipes'
import RecipeCollectionManager from '../../../Recipe/Collection/Manager.vue'

const { recipes, debug } = useKitchenConsoleRecipes()
const isDev = import.meta.dev
</script>
