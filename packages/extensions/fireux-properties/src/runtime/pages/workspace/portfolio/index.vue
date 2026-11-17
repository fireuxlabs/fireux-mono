<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template><WorkspacePortfolioHomeHero /> <WorkspacePortfolio /></template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspace: 'portfolio',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio',
    label: 'Portfolio',
    icon: 'i-lucide-layout-dashboard',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
