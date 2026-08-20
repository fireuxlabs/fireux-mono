<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-supplier-team">
      <template #header>
        <LayoutsWorkspaceNavbar title="Supplier Team">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Supplier Team" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceSupplierTeam />
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
    key: 'workspace-supplier-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
