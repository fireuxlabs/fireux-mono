<!-- Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: add the private delivery operation to the FireUX Project Console. -->
<template>
  <UDashboardPanel id="console-project-ignitions">
    <template #header>
      <LayoutsConsoleNavbar title="Ignition Requests" />
    </template>

    <template #body>
      <ConsoleProjectOperationsIgnitions />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'console-project-ignitions',
    label: 'Ignition',
    icon: 'i-lucide-rocket',
    position: 'top',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
})
</script>
