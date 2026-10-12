<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-settings">
      <template #header><LayoutsWorkspaceNavbar title="Access" /></template>
      <template #body><WorkspaceKitchenSettingsAccess /></template>
    </UDashboardPanel>
  </div>
</template>
<script setup lang="ts">
import WorkspaceKitchenSettingsAccess from '../../../../kitchen/components/Workspace/Settings/Access.vue'
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
