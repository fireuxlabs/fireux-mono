<template>
  <div class="misebox-power-card-seven">
    <SupplierItemCardsCell v-bind="supplierItem" />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  supplierItem: MiseboxPowerCardsProductDemo['cards']['supplierItem']
}>()
</script>

<style scoped>
.misebox-power-card-seven {
  width: min(22rem, calc(100vw - 2rem));
}
</style>
