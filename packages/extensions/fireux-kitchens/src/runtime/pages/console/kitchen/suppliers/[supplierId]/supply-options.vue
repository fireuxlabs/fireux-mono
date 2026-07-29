<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-supplier-supply-options">
      <template #header>
        <LayoutsConsoleNavbar title="Supplier Supply Options" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenOperationsSuppliersSupplyOptions />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-supplier-supply-options',
    label: 'Supplier Supply Options',
    icon: 'i-lucide-list-checks',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
