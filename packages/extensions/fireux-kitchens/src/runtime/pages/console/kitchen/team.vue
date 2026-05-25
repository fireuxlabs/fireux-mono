<template>
  <UDashboardPanel id="console-kitchen-team">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Team" />
    </template>

    <template #body>
      <section class="space-y-4">
        <OrganismsConsoleKitchenTeam />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    requiresSelection: true,
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
