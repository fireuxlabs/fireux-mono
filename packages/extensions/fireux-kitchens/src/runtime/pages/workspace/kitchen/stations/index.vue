<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-stations">
      <template #header>
        <LayoutsWorkspaceNavbar title="Stations" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <UPageHeader title="Stations" />
          <WorkspaceKitchenToolsToolbar capability="stations" />
          <KitchenPrepAndProductionStations />
        </section>
      </template>
    </UDashboardPanel>
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
    layouts: ['workspace'],
    hidden: true,
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
