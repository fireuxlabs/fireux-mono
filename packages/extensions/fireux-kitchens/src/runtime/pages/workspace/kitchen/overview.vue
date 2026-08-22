<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-overview">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Overview" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOverview />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-overview',
    label: 'Overview',
    group: 'Workspace',
    icon: 'i-lucide-layout-dashboard',
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
