<template>
  <PortfolioCompliance />
</template>

<script setup lang="ts">
import PortfolioCompliance from '../../../portfolio/components/Workspace/Compliance/Index.vue'

definePageMeta({
  layout: false,
  workspacePage: true,
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
