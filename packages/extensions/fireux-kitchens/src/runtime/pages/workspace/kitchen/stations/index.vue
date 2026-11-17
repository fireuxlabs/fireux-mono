<template>
  <div>
    <section class="workspace-surface">
      <UPageHeader title="Stations" />
      <WorkspaceKitchenAIFocus
        focus="kitchen-ai.prep.stations"
        label="Stations"
        context-label="Prep"
      />
      <WorkspaceKitchenToolsToolbar capability="stations" />
      <KitchenPrepAndProductionStations />
    </section>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenWorkspaceStations } from '../../../../kitchen/composables/workspace/stations/useKitchenWorkspaceStations'

provideKitchenWorkspaceStations()

definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-stations',
    label: 'Stations',
    group: 'Prep & Production',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-cooking-pot',
    icon: 'i-lucide-layout-grid',
    position: 'top',
    order: 70,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
    hidden: true,
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
