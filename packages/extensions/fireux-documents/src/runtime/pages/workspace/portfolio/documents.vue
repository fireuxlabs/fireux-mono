<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-documents">
      <template #header><WorkspaceNavbar title="Documents" /></template>
      <template #body><PortfolioDocuments /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import PortfolioDocuments from '../../../portfolio/components/Workspace/Documents/Index.vue'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-documents'] },
  nav: {
    key: 'workspace-portfolio-documents',
    label: 'Documents',
    icon: 'i-lucide-file-text',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
