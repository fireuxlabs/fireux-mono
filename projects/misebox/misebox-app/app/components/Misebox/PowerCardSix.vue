<template>
  <div class="misebox-power-card-six">
    <WorkspaceKitchenRecipesCardsCell v-bind="recipe" />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  recipe: MiseboxPowerCardsProductDemo['cards']['recipe']
}>()
</script>

<style scoped>
.misebox-power-card-six {
  width: min(20rem, calc(100vw - 2rem));
}
</style>
