<template>
  <UDashboardPanel id="console-projects-identity">
    <template #header>
      <LayoutsConsoleNavbar title="Project Identity" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleProjectIdentity />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
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
