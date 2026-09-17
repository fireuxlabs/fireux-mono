<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <WorkspaceKitchenHomeHeader />
    </template>
    <template #body>
      <WorkspaceKitchenSelector />
      <WorkspaceHero
        title="Build your Kitchen Workspace"
        description="Build and operate your Kitchen from one Workspace."
      />
      <WorkspaceKitchen />
      <WorkspaceKitchenHomeCapabilityLinks />
      <WorkspaceKitchenHomeDiscoveryLinks />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})
</script>
