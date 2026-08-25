<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-stations">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Stations">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="stations"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="stations" />
          <WorkspaceKitchenCapabilityAI
            operation="stations"
            :suggestions="stationSuggestions"
          />
          <WorkspaceKitchenCapabilityView operation="stations" />
          <WorkspaceKitchenStations />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="stations" />
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
import { useKitchenWorkspaceStations } from '../../../../kitchen/composables/workspace/Stations/useKitchenWorkspaceStations'
import { buildStationSetupSuggestions } from '../../../../kitchen/models/operation-suggestions'

const { kitchenId, stations, pending } = useKitchenWorkspaceStations()
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
    group: 'Kitchen Setup',
    icon: 'i-lucide-layout-grid',
    position: 'top',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
