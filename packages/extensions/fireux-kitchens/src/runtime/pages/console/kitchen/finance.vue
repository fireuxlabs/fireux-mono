<!-- Concurrent edit — 2026-07-21 16:57 CEST — Kitchen Finance surface: add the selected-Kitchen report route and Console navigation entry. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-finance">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Finance" />
      </template>

      <template #body>
        <ConsoleKitchenOverviewFinance />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-finance',
    label: 'Finance',
    icon: 'i-lucide-chart-line',
    position: 'top',
    order: 9,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
