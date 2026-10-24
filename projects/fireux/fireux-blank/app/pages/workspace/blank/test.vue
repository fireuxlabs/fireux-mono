<template>
  <UDashboardPanel id="workspace-blank-test">
    <template #header><WorkspaceNavbar title="Blank Test" /></template>
    <template #body>
      <WorkspaceHero compact title="Blank Test" description="Save and manage simple strings." />
      <WorkspaceBlankSelector />
      <WorkspaceAI compact aria-label="Blank Test AI"><UAlert title="Test AI is not connected yet" color="neutral" /></WorkspaceAI>
      <WorkspaceBlankTest />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace', pageTransition: false, workspace: 'blank', workspaceSurface: 'browse', 
  nav: { key: 'workspace-blank-test', label: 'Test', group: 'Workspace', icon: 'i-lucide-flask-conical', position: 'top', order: 7, desktop: true, mobile: true, layouts: ['workspace'] },
  requiresAuth: true, requiresSelection: true,
})
</script>
