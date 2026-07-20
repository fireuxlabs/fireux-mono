<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: adopt route-level console metadata. -->
<template>
  <UDashboardPanel id="console-project-apps">
    <template #header>
      <LayoutsConsoleNavbar title="Project Apps" />
    </template>

    <template #body>
      <section class="space-y-6">
        <ConsoleProjectOperationsApps />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'console-project-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    position: 'top',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
  roles: ['admin'],
})
</script>
