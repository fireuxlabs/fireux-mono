<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <WorkspaceAICapabilityPlaceholder capability="Portfolio Finance" />
  <section class="space-y-4">
    <UAlert
      color="neutral"
      variant="soft"
      title="Portfolio finance is parked"
      description="This portfolio workspace route is intentionally hidden until finance views are wired."
    />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio-finance',
    label: 'Financial Signals',
    icon: 'i-lucide-chart-line',
    position: 'top',
    order: 25,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
