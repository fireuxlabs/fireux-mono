<template>
  <FireDisclosurePanel title="Item diagnostics" class="item-diagnostics">
    <ItemDocument />
    <ItemSellingData />
  </FireDisclosurePanel>
</template>

<script setup lang="ts">
import ItemDocument from './ItemDocument.vue'
import ItemSellingData from './ItemSellingData.vue'
</script>

<style scoped>
.item-diagnostics :deep(pre) {
  overflow-x: auto;
}
</style>
