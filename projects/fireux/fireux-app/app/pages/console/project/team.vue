<template>
  <UDashboardPanel id="console-project-team">
    <template #header>
      <LayoutsConsoleNavbar title="Project Team" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProjectTeam />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-project-team',
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
