<template>
  <UDashboardPanel id="workspace-portfolio-test">
    <template #header><LayoutsWorkspaceNavbar title="Portfolio Test" /></template>
    <template #body>
      <WorkspaceHero compact title="Portfolio Test" description="Save and manage simple strings." />
      <WorkspacePortfolioSelector />
      <WorkspaceAI compact aria-label="Portfolio Test AI"><UAlert title="Test AI is not connected yet" color="neutral" /></WorkspaceAI>
      <WorkspacePortfolioTest />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace', pageTransition: false, workspace: 'portfolio', workspaceSurface: 'browse', visibility: { modules: ['fireux-properties'] },
  nav: { key: 'workspace-portfolio-test', label: 'Test', group: 'Workspace', icon: 'i-lucide-flask-conical', position: 'top', order: 7, desktop: true, mobile: true, layouts: ['workspace'] },
  requiresAuth: true, requiresSelection: true,
})
</script>
