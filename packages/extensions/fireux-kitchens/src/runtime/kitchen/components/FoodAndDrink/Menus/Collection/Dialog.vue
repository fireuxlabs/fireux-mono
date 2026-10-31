<template>
  <UModal
    v-model:open="readOpen"
    title="Menus"
    description="Read Menus in this Kitchen."
    class="menu-editor-dialog"
  >
    <template #body><KitchenFoodAndDrinkMenusCollectionList /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useKitchenMenusContext } from '../../../../composables/workspace/menus/useKitchenMenusContext'
const { dialogs } = useKitchenMenusContext()
const { readOpen } = dialogs
</script>
