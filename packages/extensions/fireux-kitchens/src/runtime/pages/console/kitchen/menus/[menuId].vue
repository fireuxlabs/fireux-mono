<template>
  <UDashboardPanel id="console-kitchen-menu-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Sections" />
    </template>

    <template #body>
      <section class="space-y-4">
        <OrganismsConsoleKitchenMenu />
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
    label: 'Menu Sections',
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
