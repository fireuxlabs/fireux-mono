<template>
  <div class="space-y-6">
    <SupplierIngredientCollectionManager
      :collection="ingredientItems"
      :title="ingredientsTitle"
      :description="ingredientsDescription"
      dev-context="console supplier · ingredients"
    />

    <DevFireuxDebugPanel
      title="Supplier ingredients"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleIngredients } from '../../../../../composables/fireux/console/supplier/Operations/Ingredients/useSupplierConsoleIngredients'

const {
  ingredientItems,
  ingredientsTitle,
  ingredientsDescription,
  debug,
} = useSupplierConsoleIngredients()
</script>
