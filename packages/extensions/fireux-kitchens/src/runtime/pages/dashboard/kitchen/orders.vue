<template>
  <UDashboardPanel id="dashboard-kitchen-orders-in">
    <template #header>
      <LayoutsDashboardNavbar title="Orders In" />
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
        </div>

        <UAlert
          color="neutral"
          variant="soft"
          title="Page stub"
          description="Temporarily stubbed while we build from Ingredients and Mise foundations."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-orders-in',
    label: 'Orders In',
    icon: 'i-lucide-receipt',
    order: 12,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
</script>
