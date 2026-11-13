<template>
  <div>
    <section class="workspace-surface">
      <UPageHeader title="Waste report" />
      <UAlert
        title="Not connected yet"
        description="Waste reporting is not connected yet. Record individual waste events from Stock &amp; Purchasing."
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
    key: 'workspace-kitchen-waste-report',
    label: 'Waste report',
    group: 'Reports',
    hidden: true,
    groupIcon: 'i-lucide-chart-no-axes-combined',
    icon: 'i-lucide-recycle',
    position: 'top',
    order: 73,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
