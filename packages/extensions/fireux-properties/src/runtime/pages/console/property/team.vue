<template>
  <UDashboardPanel id="console-property-team">
    <template #header>
      <LayoutsConsoleNavbar title="Property Team" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsolePropertyTeam />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-team',
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
