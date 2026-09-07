<template>
  <UDashboardPanel id="workspace-portfolio-calendar">
    <template #header><LayoutsWorkspaceNavbar title="Portfolio Calendar" /></template>
    <template #body>
      <WorkspaceHero compact title="Portfolio Calendar" description="Explore dates and scheduled work." />
      <WorkspacePortfolioSelector />
      <WorkspaceAI compact aria-label="Portfolio Calendar AI"><UAlert title="Calendar AI is not connected yet" color="neutral" /></WorkspaceAI>
      <WorkspacePortfolioCalendar />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace', pageTransition: false, workspace: 'portfolio', workspaceSurface: 'browse', visibility: { modules: ['fireux-properties'] },
  nav: { key: 'workspace-portfolio-calendar', label: 'Calendar', group: 'Workspace', icon: 'i-lucide-calendar', position: 'top', order: 1, desktop: false, mobile: false, layouts: ['workspace'] },
  requiresAuth: true, requiresSelection: true,
})
</script>
