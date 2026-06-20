<template>
  <UDashboardPanel id="console-kitchen-menu-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Menu" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMenusCreate />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-create',
    label: 'Create Menu',
    icon: 'i-lucide-plus',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
