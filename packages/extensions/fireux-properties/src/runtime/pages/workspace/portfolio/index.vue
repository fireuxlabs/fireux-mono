<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Portfolio Workspace" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspacePortfolioIndex />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
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
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
