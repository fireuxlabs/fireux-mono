<template>
  <UDashboardPanel id="console-kitchen-mise-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Mise" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenMiseTask />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-mise-detail',
    label: 'Mise Detail',
    icon: 'i-lucide-list-todo',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
