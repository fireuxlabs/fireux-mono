<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-compliance">
      <template #header><WorkspaceNavbar title="Compliance" /></template>
      <template #body><PortfolioCompliance /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import PortfolioCompliance from '../../../portfolio/components/Workspace/Compliance/Index.vue'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-compliance'] },
  nav: {
    key: 'workspace-portfolio-compliance',
    label: 'Compliance',
    icon: 'i-lucide-shield-check',
    position: 'top',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
