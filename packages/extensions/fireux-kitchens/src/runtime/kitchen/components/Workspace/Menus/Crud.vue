<template>
  <div>
    <WorkspaceCrudToolbar
      label="Menus"
      :available="derived.capability.availableActions"
      @create="actions.openCreate"
      @read="actions.openRead"
    />

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
import { useKitchenMenusWorkspace } from '../../../composables/workspace/Menus/useKitchenMenusWorkspace'

const { derived, primitiveModals, actions } = useKitchenMenusWorkspace()
const { createOpen, readOpen } = primitiveModals
</script>
