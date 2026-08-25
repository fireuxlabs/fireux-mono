<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-waste">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Waste" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenWasteTools />
          <WorkspaceKitchenWasteAI />
          <WorkspaceKitchenWaste />
          <WorkspaceKitchenResearchSegue
            capability="Waste"
            base-path="/workspace/kitchen/waste/search-demand"
          />
          <WorkspaceKitchenWasteDev v-if="isDevelopment" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const isDevelopment = import.meta.dev

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-waste',
    label: 'Waste',
    group: 'Operations',
    icon: 'i-lucide-trash-2',
    position: 'top',
    order: 26,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
