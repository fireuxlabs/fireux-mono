<template>
  <WorkspaceKitchenHomeHeader />
  <WorkspaceKitchenSelector />
  <UPageHeader
    title="Build your Kitchen Workspace"
    description="Build and operate your Kitchen from one Workspace."
  />
  <WorkspaceKitchen />
  <WorkspaceKitchenHomeCapabilityLinks />
  <WorkspaceKitchenHomeDiscoveryLinks />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})
</script>
