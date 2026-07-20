<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: adopt route-level console metadata. -->
<template>
  <UDashboardPanel id="console-project-home">
    <template #header>
      <LayoutsConsoleNavbar title="Project Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProjectIndex />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  nav: {
    key: 'console-project',
    label: 'Project',
    icon: 'i-lucide-briefcase-business',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
})
</script>
