<template>
  <UDashboardPanel id="console-blank-team">
    <template #header>
      <LayoutsConsoleNavbar title="Blank Team" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleBlankTeam />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-blank-team',
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
