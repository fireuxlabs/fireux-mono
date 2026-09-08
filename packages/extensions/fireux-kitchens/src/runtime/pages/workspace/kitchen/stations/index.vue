<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-stations">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Stations">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="stations"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenStationsSelector />
          <WorkspaceKitchenCapabilityTools capability="stations" />
          <WorkspaceKitchenCapabilityAI
            capability="stations"
            :suggestions="stationSuggestions"
          />
          <WorkspaceKitchenCapabilityView capability="stations" />
          <WorkspaceKitchenStations />
          <WorkspaceKitchenCapabilityGuidingLiterature capability="stations" />
          <WorkspaceKitchenResearchSegue
            capability="Stations"
            base-path="/workspace/kitchen/stations/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenWorkspaceStations } from '../../../../kitchen/composables/workspace/Stations/useKitchenWorkspaceStations'
import { buildStationSetupSuggestions } from '../../../../kitchen/models/capability-suggestions'

const { kitchenId, stations, pending } = provideKitchenWorkspaceStations()
const stationSuggestions = computed(() =>
  kitchenId.value && !pending.value
    ? buildStationSetupSuggestions(stations.value)
    : []
)

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-stations',
    label: 'Stations',
    group: 'Settings',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-settings-2',
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
