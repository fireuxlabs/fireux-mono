<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: adopt route-level console metadata. -->
<template>
  <UDashboardPanel id="console-project-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Project Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProjectOverview />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  nav: {
    key: 'console-project-overview',
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
  roles: ['admin'],
})
</script>
