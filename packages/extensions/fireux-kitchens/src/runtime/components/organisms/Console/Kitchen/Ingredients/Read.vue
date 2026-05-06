<template>
  <div class="space-y-6">
    <OrganismsIngredientCollectionManager
      :collection="ingredients"
      title="Ingredients"
      description="Browse ingredients for the selected kitchen."
      :link="true"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen ingredients"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleIngredients } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleIngredients'

const { ingredients, debug } = useKitchenConsoleIngredients()
const isDev = import.meta.dev
</script>
