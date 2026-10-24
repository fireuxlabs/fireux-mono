<template>
  <section v-if="storageKitchenId" class="grid gap-6" aria-label="Menus">
    <KitchenFoodAndDrinkMenusCollection />
    <MoleculesDisclosurePanel title="KitchenAI" :default-open="false">
      <KitchenFoodAndDrinkMenusAi />
    </MoleculesDisclosurePanel>
  </section>
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    state="error"
    title="Kitchen unavailable"
    :description="String(error || 'Your Kitchen could not be loaded.')"
  />
  <p v-else-if="outcome === 'pending'" role="status">Loading Kitchen…</p>
  <UAlert
    v-else-if="outcome === 'missing'"
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
