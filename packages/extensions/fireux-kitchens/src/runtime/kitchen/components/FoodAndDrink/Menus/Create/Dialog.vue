<template>
  <UModal
    v-model:open="createOpen"
    title="Create Menu"
    description="Upload a PDF or photos, paste a menu URL, or start blank."
    class="menu-editor-dialog menu-editor-dialog--create"
  >
    <template #body><KitchenFoodAndDrinkMenusCreate /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useKitchenMenusContext } from '../../../../composables/workspace/menus/useKitchenMenusContext'
const { dialogs } = useKitchenMenusContext()
const { createOpen } = dialogs
</script>
