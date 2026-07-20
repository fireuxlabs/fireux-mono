<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-supplier-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="console-profile">
        <ConsoleSupplierIdentity />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const navTitle = 'Supplier Identity'

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'console-supplier-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
