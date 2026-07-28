<template>
  <div class="misebox-power-card-one">
    <div class="misebox-power-card-one__cards">
      <KitchenCardsCell
        v-for="kitchen in kitchens"
        :key="kitchen.id"
        v-bind="kitchen"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  kitchens: MiseboxPowerCardsProductDemo['cards']['kitchens']
}>()
</script>

<style scoped>
.misebox-power-card-one {
  display: grid;
  width: min(100%, 24rem);
  min-width: 0;
}

.misebox-power-card-one__cards {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
}
</style>
