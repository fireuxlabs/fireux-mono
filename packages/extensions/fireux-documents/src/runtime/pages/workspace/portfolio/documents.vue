<template>
  <PortfolioDocuments />
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
    menus: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
