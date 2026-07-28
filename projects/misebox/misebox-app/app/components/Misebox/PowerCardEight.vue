<template>
  <div class="misebox-power-card-eight">
    <MenuOrderKioskItem :currency-code="currencyCode" :item="item" />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  item: MiseboxPowerCardsProductDemo['cards']['orderItem']['item']
  currencyCode: MiseboxPowerCardsProductDemo['cards']['orderItem']['currencyCode']
}>()
</script>

<style scoped>
.misebox-power-card-eight {
  width: min(19rem, calc(100vw - 2rem));
}
</style>
