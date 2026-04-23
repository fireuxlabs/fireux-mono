<template>
  <UDashboardPanel id="console-kitchen-orders">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Orders" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen orders."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleKitchenOrders v-else />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-orders',
    label: 'Orders',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    requiresSelection: true,
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen } = useKitchenConsole()
</script>
