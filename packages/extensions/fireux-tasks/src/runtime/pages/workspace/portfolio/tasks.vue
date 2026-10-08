<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-tasks">
      <template #header><LayoutsWorkspaceNavbar title="Tasks" /></template>
      <template #body><PortfolioTasks /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import PortfolioTasks from '../../../portfolio/components/Workspace/Tasks/Index.vue'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-tasks'] },
  nav: {
    key: 'workspace-portfolio-tasks',
    label: 'Tasks',
    icon: 'i-lucide-list-checks',
    position: 'top',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
