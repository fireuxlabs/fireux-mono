<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-overview">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Overview" />
      </template>

      <template #body>
        <WorkspaceFreemium
          family="kitchen"
          capability="overview"
          page-label="Overview"
          placement="top"
        />
        <section class="space-y-4">
          <WorkspaceKitchenOverview />
          <WorkspaceKitchenResearchSegue
            capability="Overview"
            base-path="/workspace/kitchen/overview/search-demand"
          />
        </section>
        <WorkspaceFreemium
          family="kitchen"
          capability="overview"
          page-label="Overview"
          placement="bottom"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
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
