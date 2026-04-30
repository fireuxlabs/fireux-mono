<template>
  <UDashboardPanel id="console-kitchen-identity">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Identity" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenIdentity />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    requiresSelection: true,
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
