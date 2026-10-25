<!-- Concurrent edit — 2026-07-20 16:22 CEST — Extension Workspace Spine pass: move route access metadata and park the unwired Properties view. -->
<template>
  <WorkspaceAICapabilityPlaceholder capability="Portfolio Properties" />
  <section class="space-y-4">
    <WorkspacePortfolioProperties />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio-properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
