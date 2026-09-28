<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-prep">
      <template #header
        ><LayoutsWorkspaceNavbar title="Prep & Production"
      /></template>
      <template #body><WorkspaceKitchenPrep /></template>
    </UDashboardPanel>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-prep',
    label: 'Prep & Production',
    icon: 'i-lucide-cooking-pot',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      { label: 'Prep plan', to: '/workspace/kitchen/prep' },
      { label: 'Stations', to: '/workspace/kitchen/stations' },
      { label: 'Batches', to: '/workspace/kitchen/prep/batches' },
    ],
  },
})
</script>
