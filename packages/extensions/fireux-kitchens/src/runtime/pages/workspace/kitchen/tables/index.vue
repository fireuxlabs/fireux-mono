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
          title="Tables are not connected yet"
          description="Table layout, seating and open tabs will be available here when Front of House is connected. Orders can continue through the kitchen queue."
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
