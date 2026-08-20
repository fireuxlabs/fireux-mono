<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-supplier-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Supplier Workspace" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceSupplierIndex />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
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
