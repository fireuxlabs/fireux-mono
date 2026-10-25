<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <UPageHeader
    title="Build your Supplier Workspace"
    description="Manage catalogues, ingredients and supply operations."
  />
  <WorkspaceSupplier />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspace: 'supplier',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
