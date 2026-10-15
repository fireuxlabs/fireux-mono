<template>
  <UModal
    v-model:open="createOpen"
    title="Create Menu"
    description="Create or import a Menu for this Kitchen."
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body><WorkspaceKitchenMenusCreate /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useKitchenMenusContext } from '../../../../composables/workspace/menus/useKitchenMenusContext'
const { dialogs } = useKitchenMenusContext()
const { createOpen } = dialogs
</script>
