<template>
  <UDashboardPanel id="console-kitchen-mise">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Mise" />
    </template>

    <template #body>
      <section class="space-y-4">
        <OrganismsConsoleKitchenMise />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-mise',
    label: 'Mise',
    icon: 'i-lucide-list-todo',
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
