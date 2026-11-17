<template>
  <div>
    <section class="workspace-surface">
      <UPageHeader title="Food costs" />
      <WorkspaceKitchenAIFocus
        focus="kitchen-ai.reports.food-costs"
        label="Food costs"
        context-label="Reports"
      />
      <UAlert
        title="Not connected yet"
        description="Recipe costs, purchase prices and actual usage are not connected into this report yet."
        color="warning"
        variant="subtle"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-costs',
    label: 'Food costs',
    group: 'Reports',
    hidden: true,
    groupIcon: 'i-lucide-chart-no-axes-combined',
    icon: 'i-lucide-calculator',
    position: 'top',
    order: 72,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
