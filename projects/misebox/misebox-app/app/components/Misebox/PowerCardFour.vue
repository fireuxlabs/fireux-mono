<template>
  <div class="misebox-power-card-four">
    <ConsoleKitchenOperationsDishesCardsCell
      v-bind="dish"
    />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  dish: MiseboxPowerCardsProductDemo['cards']['dish']
}>()
</script>

<style scoped>
.misebox-power-card-four {
  width: 9rem;
}
</style>
