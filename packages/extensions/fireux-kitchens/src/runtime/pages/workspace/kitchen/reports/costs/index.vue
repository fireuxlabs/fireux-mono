<template>
  <div>
    <section class="workspace-surface">
      <UPageHeader title="Food costs" />
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
  layout: false,
  workspacePage: true,
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
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
