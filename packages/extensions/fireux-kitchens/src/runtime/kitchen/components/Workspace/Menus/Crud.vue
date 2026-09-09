<template>
  <div>
    <div class="space-y-2">
      <WorkspaceCrudToolbar
        label="Menus"
        :available="
          derived.capability.availableActions.filter(
            (action) => action === 'create' || action === 'read'
          )
        "
        @create="actions.openCreate"
        @read="actions.openRead"
      />
      <p class="text-xs text-muted">
        {{ menuCount }}
        {{
          menuLimit === null
            ? 'menus · unlimited allowance'
            : `of ${menuLimit} menus`
        }}
        <span v-if="menuCount > menus.length">
          · {{ menuCount - menus.length }} archived</span
        >
      </p>
      <p v-if="menuCreateBlockedMessage" class="text-xs text-muted">
        {{ menuCreateBlockedMessage }}
      </p>
    </div>

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

const {
  derived,
  primitiveModals,
  actions,
  menuCount,
  menus,
  menuLimit,
  menuCreateBlockedMessage,
} = useKitchenMenusContext()
const { createOpen, readOpen } = primitiveModals
</script>
