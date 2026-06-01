<template>
  <div class="space-y-6">
    <SupplierIngredientCollectionManager
      :collection="ingredientItems"
      :title="ingredientsTitle"
      :description="ingredientsDescription"
      dev-context="console supplier · ingredients"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Supplier ingredients"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleIngredients } from '../../../../composables/fireux/console/supplier/operations/useSupplierConsoleIngredients'

const {
  ingredientItems,
  ingredientsTitle,
  ingredientsDescription,
  debug,
} = useSupplierConsoleIngredients()
const isDev = import.meta.dev
</script>
