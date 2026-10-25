<template>
  <WorkspaceHero
    compact
    title="Supplier Calendar"
    description="Explore dates and scheduled work."
  />
  <WorkspaceSupplierSelector />
  <WorkspaceAI compact aria-label="Supplier Calendar AI"
    ><UAlert
      title="Calendar AI is not connected yet"
      color="neutral"
    /> </WorkspaceAI
  ><WorkspaceSupplierCalendar />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'supplier',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-calendar',
    label: 'Calendar',
    group: 'Workspace',
    icon: 'i-lucide-calendar',
    position: 'top',
    order: 1,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
