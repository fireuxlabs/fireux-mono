<!-- Concurrent edit — 2026-07-20 16:22 CEST — Extension Console Spine pass: move route access metadata and park the unwired Properties view. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-properties">
      <template #header>
        <LayoutsConsoleNavbar title="Properties">
          <template #right>
            <ConsoleAIOperationPlaceholder operation="Portfolio Properties" />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsolePortfolioOperationsProperties />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-portfolio-properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
