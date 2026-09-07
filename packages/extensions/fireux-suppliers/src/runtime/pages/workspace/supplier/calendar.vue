<template>
  <UDashboardPanel id="workspace-supplier-calendar">
    <template #header><LayoutsWorkspaceNavbar title="Supplier Calendar" /></template>
    <template #body>
      <WorkspaceHero compact title="Supplier Calendar" description="Explore dates and scheduled work." />
      <WorkspaceSupplierSelector />
      <WorkspaceAI compact aria-label="Supplier Calendar AI"><UAlert title="Calendar AI is not connected yet" color="neutral" /></WorkspaceAI>
      <WorkspaceSupplierCalendar />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace', pageTransition: false, workspace: 'supplier', workspaceSurface: 'browse', visibility: { modules: ['fireux-suppliers'] },
  nav: { key: 'workspace-supplier-calendar', label: 'Calendar', group: 'Workspace', icon: 'i-lucide-calendar', position: 'top', order: 1, desktop: false, mobile: false, layouts: ['workspace'] },
  requiresAuth: true, requiresSelection: true,
})
</script>
