<template>
  <UDashboardPanel id="workspace-blank-home">
    <template #header><LayoutsWorkspaceNavbar title="Blank Workspace" /></template>
    <template #body>
      <WorkspaceHero title="Blank Workspace" description="Choose a record and explore its capabilities." />
      <WorkspaceBlankSelector />
      <WorkspaceAI compact aria-label="Blank Landing AI"><UAlert title="Landing AI is not connected yet" color="neutral" /></WorkspaceAI>
      <WorkspaceBlank />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace', pageTransition: false, workspace: 'blank', workspaceSurface: 'browse',
  requiresAuth: false, requiresSelection: false,
  nav: { key: 'workspace-blank', label: 'Blank', icon: 'i-lucide-square-dashed', position: 'bottom', order: 900, desktop: true, mobile: true, layouts: ['workspace'] },
})
useSeoMeta({ title: 'Blank Workspace', description: 'Choose a record and explore its capabilities.' })
</script>
