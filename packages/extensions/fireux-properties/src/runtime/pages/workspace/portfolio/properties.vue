<!-- Concurrent edit — 2026-07-20 16:22 CEST — Extension Workspace Spine pass: move route access metadata and park the unwired Properties view. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-properties">
      <template #header>
        <LayoutsWorkspaceNavbar title="Properties">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Portfolio Properties" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspacePortfolioProperties />
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
