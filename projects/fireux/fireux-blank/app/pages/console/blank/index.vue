<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: adopt route-level console metadata. -->
<template>
  <UDashboardPanel id="console-blank-home">
    <template #header>
      <LayoutsConsoleNavbar title="Blank Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleBlankIndex />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  nav: {
    key: 'console-blank',
    label: 'Blank',
    icon: 'i-lucide-square-dashed',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
