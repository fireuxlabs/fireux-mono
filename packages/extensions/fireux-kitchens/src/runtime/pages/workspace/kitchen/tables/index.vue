<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-tables-boundary">
      <template #header>
        <LayoutsWorkspaceNavbar title="Tables" />
      </template>

      <template #body>
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-panel-left-close"
          title="Front-of-House capability"
          description="Tables are not owned by the Kitchen Workspace. Kitchen Orders may reference service context across this boundary, but table layout, seating, tabs, and payment belong to Front of House."
        />
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
    key: 'workspace-kitchen-tables-boundary',
    label: 'Tables',
    hidden: true,
    icon: 'i-lucide-panel-left-close',
    position: 'top',
    order: 900,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
