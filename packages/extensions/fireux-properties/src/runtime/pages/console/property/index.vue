<template>
  <UDashboardPanel id="console-property-home">
    <template #header>
      <LayoutsConsoleNavbar title="Property Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProperty />
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
    label: 'Property',
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
