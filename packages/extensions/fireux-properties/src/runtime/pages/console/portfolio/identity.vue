<template>
  <UDashboardPanel id="console-portfolio-identity">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Identity" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsolePortfolioIdentity />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-identity',
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
