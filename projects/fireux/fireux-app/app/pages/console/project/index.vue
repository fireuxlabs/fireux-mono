<template>
  <UDashboardPanel id="console-project-home">
    <template #header>
      <LayoutsConsoleNavbar title="Project Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProjectIndex />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-project',
    label: 'Project',
    icon: 'i-lucide-briefcase-business',
    position: 'bottom',
    requiresSelection: false,
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
