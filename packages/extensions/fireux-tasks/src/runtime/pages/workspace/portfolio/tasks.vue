<template>
  <PortfolioTasks />
</template>

<script setup lang="ts">
import PortfolioTasks from '../../../portfolio/components/Workspace/Tasks/Index.vue'

definePageMeta({
  layout: false,
  workspacePage: true,
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
