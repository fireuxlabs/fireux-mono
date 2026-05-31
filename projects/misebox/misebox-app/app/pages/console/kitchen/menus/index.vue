<template>
  <UDashboardPanel id="console-kitchen-menus">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Menus" />
    </template>

    <template #body>
      <section class="space-y-4">
        <MiseboxConsoleKitchenMenuDocUpload />
        <ConsoleKitchenMenus />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menus',
    label: 'Menus',
    icon: 'i-lucide-book-open',
    position: 'top',
    requiresSelection: true,
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
