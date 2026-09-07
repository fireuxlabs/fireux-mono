<template>
  <UDashboardPanel id="workspace-supplier-test">
    <template #header><LayoutsWorkspaceNavbar title="Supplier Test" /></template>
    <template #body>
      <WorkspaceHero compact title="Supplier Test" description="Save and manage simple strings." />
      <WorkspaceSupplierSelector />
      <WorkspaceAI compact aria-label="Supplier Test AI"><UAlert title="Test AI is not connected yet" color="neutral" /></WorkspaceAI>
      <WorkspaceSupplierTest />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace', pageTransition: false, workspace: 'supplier', workspaceSurface: 'browse', visibility: { modules: ['fireux-suppliers'] },
  nav: { key: 'workspace-supplier-test', label: 'Test', group: 'Workspace', icon: 'i-lucide-flask-conical', position: 'top', order: 7, desktop: true, mobile: true, layouts: ['workspace'] },
  requiresAuth: true, requiresSelection: true,
})
</script>
