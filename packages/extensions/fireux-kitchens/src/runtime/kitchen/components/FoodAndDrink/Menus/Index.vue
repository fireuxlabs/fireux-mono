<template>
  <section v-if="storageKitchenId" class="fx-page-stack" aria-label="Menus">
    <UButton
      to="/workspace/kitchen/food-and-drink/menus/prepare"
      icon="i-lucide-file-scan"
      variant="outline"
      >Prepare a Menu from a source</UButton
    >
    <KitchenFoodAndDrinkMenusCollection />
    <FireDisclosurePanel title="KitchenAI" :default-open="false">
      <KitchenFoodAndDrinkMenusAi />
    </FireDisclosurePanel>
  </section>
  <FireState
    v-else-if="outcome === 'error' || outcome === 'pending'"
    :outcome="outcome"
    entity="Kitchen"
    :error="error"
  />
  <UAlert
    v-else-if="outcome === 'empty'"
    color="neutral"
    title="Kitchen not found"
    description="Choose an available Kitchen to manage its Menus."
    :actions="[{ label: 'Choose kitchen', to: workspaceEntryPath }]"
  />
  <UAlert
    v-else
    color="neutral"
    variant="soft"
    title="Choose a kitchen"
    :actions="[{ label: 'Choose kitchen', to: workspaceEntryPath }]"
  />
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const { storageKitchenId, outcome, error } = useKitchenMenusContext()
</script>

<style src="../../../../menu/assets/styles/menu-editor.css"></style>
