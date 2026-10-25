<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <WorkspaceHero
    compact
    title="Supplier Overview"
    description="Supplier workspace overview."
  />
  <WorkspaceSupplierSelector />
  <WorkspaceAI compact aria-label="Supplier Overview AI"
    ><UAlert title="Overview AI is not connected yet" color="neutral" />
  </WorkspaceAI>
  <section class="space-y-4">
    <WorkspaceSupplierOverview />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
