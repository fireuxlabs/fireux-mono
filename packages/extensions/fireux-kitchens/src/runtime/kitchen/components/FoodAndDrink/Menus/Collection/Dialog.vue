<template>
  <UModal
    v-model:open="readOpen"
    title="Menus"
    description="Read Menus in this Kitchen."
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body><KitchenFoodAndDrinkMenusCollectionList /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useKitchenMenusContext } from '../../../../composables/workspace/menus/useKitchenMenusContext'
const { dialogs } = useKitchenMenusContext()
const { readOpen } = dialogs
</script>
