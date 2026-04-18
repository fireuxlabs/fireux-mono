<template>
  <UDashboardPanel id="console-projects-apps">
    <template #header>
      <LayoutsConsoleNavbar title="Project Apps" />
    </template>

    <template #body>
      <section class="space-y-6">
        <ConsoleProjectApps />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-projects-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
