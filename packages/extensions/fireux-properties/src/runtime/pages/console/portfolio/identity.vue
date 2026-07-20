<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
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
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-portfolio-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
