<template>
  <ItemDocument class="item-data-panel" />
  <ItemSellingData class="item-data-panel" />
  <ItemProductionData class="item-data-panel" />
  <ItemTrainingData class="item-data-panel" />
</template>

<script setup lang="ts">
import ItemDocument from './ItemDocument.vue'
import ItemProductionData from './ItemProductionData.vue'
import ItemSellingData from './ItemSellingData.vue'
import ItemTrainingData from './ItemTrainingData.vue'
</script>

<style scoped>
.item-data-panel {
  min-inline-size: 0;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: calc(var(--spacing) * 4);
}
.item-data-panel :deep(pre) {
  overflow-x: auto;
}
</style>
