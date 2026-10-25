<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <WorkspaceAICapabilityPlaceholder capability="Supplier Ingredients" />
  <section class="space-y-4">
    <WorkspaceSupplierIngredients />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-wheat',
    position: 'top',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
