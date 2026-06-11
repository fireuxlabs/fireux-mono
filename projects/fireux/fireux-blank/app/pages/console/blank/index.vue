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
  nav: {
    key: 'console-blank',
    label: 'Blank',
    icon: 'i-lucide-square-dashed',
    position: 'bottom',
    requiresSelection: false,
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
