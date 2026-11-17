<template>
  <UModal
    v-model:open="readOpen"
    title="Menus"
    description="Read Menus in this Kitchen."
    class="menu-editor-dialog"
  >
    <template #body><KitchenMenuMenusCollectionList /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useKitchenMenus } from '../../../../composables/workspace/menus/useKitchenMenus'
const { dialogs } = useKitchenMenus()
const { readOpen } = dialogs
</script>
