<template>
  <div class="misebox-power-card-five">
    <WorkspaceKitchenMiseCardsPreview v-bind="mise" />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxPowerCardsProductDemo } from '../composables/product-demo/useMiseboxPowerCardsProductDemo'

defineProps<{
  mise: MiseboxPowerCardsProductDemo['cards']['mise']
}>()
</script>

<style scoped>
.misebox-power-card-five {
  width: min(20rem, calc(100vw - 2rem));
}
</style>
