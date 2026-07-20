<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: adopt route-level console metadata. -->
<template>
  <UDashboardPanel id="console-blank-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Blank Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleBlankOverview />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  nav: {
    key: 'console-blank-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
