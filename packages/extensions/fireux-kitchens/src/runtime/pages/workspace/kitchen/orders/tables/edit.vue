<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-tables-edit">
      <template #header>
        <LayoutsWorkspaceNavbar title="Tables" />
      </template>

      <template #body>
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-panel-left-close"
          title="Front-of-House capability"
          description="Tables are not edited by the Kitchen Workspace. Table layout, seating, tabs, and payment belong to Front of House."
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'edit',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-tables-edit-boundary',
    label: 'Tables',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
