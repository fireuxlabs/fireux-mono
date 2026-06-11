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
  nav: {
    key: 'console-blank-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    requiresSelection: true,
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
