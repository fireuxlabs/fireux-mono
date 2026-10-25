<template>
  <PortfolioDocuments />
</template>

<script setup lang="ts">
import PortfolioDocuments from '../../../portfolio/components/Workspace/Documents/Index.vue'

definePageMeta({
  layout: false,
  workspacePage: true,
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
