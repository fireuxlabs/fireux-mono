<template>
  <UDashboardPanel id="console-property-home">
    <template #header>
      <LayoutsConsoleNavbar title="Properties" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProperties />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property',
    label: 'Properties',
    icon: 'i-lucide-house',
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
