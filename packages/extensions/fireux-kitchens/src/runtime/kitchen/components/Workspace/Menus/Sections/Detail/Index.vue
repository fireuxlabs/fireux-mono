<template>
  <section class="workspace-surface">
    <UAlert
      v-if="outcome === 'denied'"
      color="warning"
      title="Menu access unavailable"
      description="Sign in with access to this Kitchen to open its menus."
    />
    <MoleculesCopyError v-else-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status">Loading Menu…</p>
    <UAlert
      v-else-if="outcome === 'idle'"
      color="neutral"
      title="Select a Kitchen"
    />
    <UAlert
      v-else-if="!menu"
      color="neutral"
      :title="selectedKitchen ? 'Menu not found' : 'Kitchen not found'"
    />
    <template v-else>
      <UAlert v-if="!canWrite" color="neutral" title="Read-only Menu" />
      <WorkspaceKitchenMenusItemsEdit />
      <WorkspaceKitchenMenusItemsAddRepertoire />
      <WorkspaceKitchenMenusItemsAddByName />
      <WorkspaceKitchenMenusItemsAddMealDeal />
    </template>
  </section>
</template>

<script setup lang="ts">
import { provideKitchenWorkspaceMenuSection } from '../../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { provideKitchenMenuRecordContext } from '../../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const menuState = provideKitchenMenuRecordContext()
const { menu, outcome, error, pending, canWrite, selectedKitchen } = menuState
provideKitchenWorkspaceMenuSection(menuState)
</script>
