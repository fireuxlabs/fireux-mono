<template>
  <!-- Concurrent edit — 2026-07-20 15:11 CEST — Pre-order console route: add the focused operator confirmation doorway. -->
  <UDashboardPanel id="console-kitchen-pre-orders">
    <template #header>
      <LayoutsConsoleNavbar title="Pre-orders">
        <template #right>
          <UButton
            to="/console/kitchen/orders"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            label="Orders"
          />
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <ConsoleKitchenOperationsOrdersPreOrders />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'live',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
