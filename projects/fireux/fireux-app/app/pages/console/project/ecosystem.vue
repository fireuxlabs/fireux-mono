<template>
  <UDashboardPanel id="console-project-ecosystem">
    <template #header>
      <LayoutsConsoleNavbar title="Project Ecosystem" />
    </template>

    <template #body>
      <section class="space-y-6">
        <ConsoleProjectOperationsEcosystem />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-project-ecosystem',
    label: 'Ecosystem',
    icon: 'i-lucide-orbit',
    position: 'top',
    requiresSelection: true,
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
