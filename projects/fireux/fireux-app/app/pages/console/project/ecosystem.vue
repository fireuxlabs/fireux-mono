<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: adopt route-level console metadata. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-project-ecosystem">
      <template #header>
        <LayoutsConsoleNavbar title="Project Ecosystem" />
      </template>

      <template #body>
        <section class="space-y-6">
          <ConsoleProjectOperationsEcosystem />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'console-project-ecosystem',
    label: 'Ecosystem',
    icon: 'i-lucide-orbit',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
  roles: ['admin'],
})
</script>
