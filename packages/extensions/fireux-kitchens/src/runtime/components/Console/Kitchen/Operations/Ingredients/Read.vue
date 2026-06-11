<template>
  <div class="space-y-6">
    <IngredientCollectionManager
      :collection="ingredients"
      title="Ingredients"
      description="Browse ingredients for the selected kitchen."
      :link="true"
    />

    <DevFireuxDebugPanel
      title="Kitchen ingredients"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleIngredients } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenConsoleIngredients'

const { ingredients, debug } = useKitchenConsoleIngredients()
</script>
