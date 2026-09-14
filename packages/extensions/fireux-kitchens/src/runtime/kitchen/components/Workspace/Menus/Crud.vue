<template>
  <div>
    <UModal
      v-model:open="createOpen"
      title="Create Menu"
      description="Create or import a Menu for this Kitchen."
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body><WorkspaceKitchenMenusCreation /></template>
    </UModal>

    <UModal
      v-model:open="readOpen"
      title="Menus"
      description="Read Menus in this Kitchen."
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body><WorkspaceKitchenMenusList /></template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'

const { primitiveModals } = useKitchenMenusContext()
const { createOpen, readOpen } = primitiveModals
</script>
