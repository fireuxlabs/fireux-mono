<template>
  <UDashboardPanel id="console-kitchen-menu-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Detail" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMenusMenu />
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
    key: 'console-kitchen-menu-detail',
    label: 'Menu Detail',
    icon: 'i-lucide-list-tree',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
