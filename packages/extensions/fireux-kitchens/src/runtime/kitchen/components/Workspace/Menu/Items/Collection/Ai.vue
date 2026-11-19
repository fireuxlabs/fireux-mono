<template>
  <details v-if="storageKitchenId" class="kitchen-record-assistant">
    <summary>Ask KitchenAI about your items</summary>
    <WorkspaceKitchenAIFocus
      focus="kitchen-ai.menu.items"
      label="Items"
      context-label="Menu"
    />
  </details>
</template>

<script setup lang="ts">
import { useItemCatalogueContext } from '../../../../../composables/workspace/menu/items/useItemCatalogue'

const { storageKitchenId } = useItemCatalogueContext()
</script>

<style scoped>
@import '../../../record-tools.css';
</style>
