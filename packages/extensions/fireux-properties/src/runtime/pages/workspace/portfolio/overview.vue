<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-overview">
      <template #header>
        <WorkspaceNavbar title="Portfolio Overview" />
      </template>

      <template #body>
        <WorkspaceHero compact title="Portfolio Overview" description="Portfolio workspace overview." />
        <WorkspacePortfolioSelector />
        <WorkspaceAI compact aria-label="Portfolio Overview AI"><UAlert title="Overview AI is not connected yet" color="neutral" /></WorkspaceAI>
        <section class="space-y-4">
          <WorkspacePortfolioOverview />
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
    key: 'workspace-portfolio-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
