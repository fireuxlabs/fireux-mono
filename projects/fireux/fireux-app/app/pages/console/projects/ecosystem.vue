<template>
  <UDashboardPanel id="console-projects-ecosystem">
    <template #header>
      <LayoutsConsoleNavbar title="Project Ecosystems" />
    </template>

    <template #body>
      <ConsoleProjectEcosystem />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-projects-ecosystem',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
