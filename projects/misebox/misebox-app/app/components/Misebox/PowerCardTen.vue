<template>
  <div class="misebox-power-card-ten">
    <WorkspaceKitchenOperationsSuppliersCardsCell v-bind="supplier" />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  supplier: MiseboxPowerCardsProductDemo['cards']['supplier']
}>()
</script>

<style scoped>
.misebox-power-card-ten {
  width: min(20rem, calc(100vw - 2rem));
}
</style>
