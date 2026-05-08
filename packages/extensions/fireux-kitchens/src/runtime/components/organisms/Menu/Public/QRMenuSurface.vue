<template>
  <div class="qr-menu-surface">
    <KitchenQRMenu :menu="surface" />
  </div>
</template>

<script setup lang="ts">
import KitchenQRMenu from './QRMenu.vue'

defineProps<{
  surface: any
}>()
</script>

<style scoped>
.qr-menu-surface {
  display: contents;
}
</style>
