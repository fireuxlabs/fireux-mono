<template>
  <div class="misebox-power-card-three">
    <MenuCardsCell :menu="menu" :route-scope="{ kind: 'root' }" />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  menu: MiseboxPowerCardsProductDemo['cards']['menu']
}>()
</script>

<style scoped>
.misebox-power-card-three {
  width: min(24rem, calc(100vw - 2rem));
}
</style>
