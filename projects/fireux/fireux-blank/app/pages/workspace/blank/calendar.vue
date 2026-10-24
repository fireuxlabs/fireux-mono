<template>
  <UDashboardPanel id="workspace-blank-calendar">
    <template #header><WorkspaceNavbar title="Blank Calendar" /></template>
    <template #body>
      <WorkspaceHero compact title="Blank Calendar" description="Explore dates and scheduled work." />
      <WorkspaceBlankSelector />
      <WorkspaceAI compact aria-label="Blank Calendar AI"><UAlert title="Calendar AI is not connected yet" color="neutral" /></WorkspaceAI>
      <WorkspaceBlankCalendar />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace', pageTransition: false, workspace: 'blank', workspaceSurface: 'browse', 
  nav: { key: 'workspace-blank-calendar', label: 'Calendar', group: 'Workspace', icon: 'i-lucide-calendar', position: 'top', order: 1, desktop: false, mobile: false, layouts: ['workspace'] },
  requiresAuth: true, requiresSelection: true,
})
</script>
