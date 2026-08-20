<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-supplier-identity">
      <template #header>
        <LayoutsWorkspaceNavbar :title="navTitle">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Supplier Identity" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <div class="workspace-profile">
          <WorkspaceSupplierIdentity />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const navTitle = 'Supplier Identity'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
