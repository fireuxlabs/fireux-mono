<template>
  <UDashboardPanel id="console-portfolio-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="console-profile">
        <ConsolePortfolioIdentity />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const navTitle = 'Portfolio Identity'

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
