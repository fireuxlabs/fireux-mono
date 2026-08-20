<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-supplier-items">
      <template #header>
        <LayoutsWorkspaceNavbar title="Items">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Supplier Items" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceSupplierOperationsItems />
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
    key: 'workspace-supplier-items',
    label: 'Items',
    icon: 'i-lucide-package',
    position: 'top',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
