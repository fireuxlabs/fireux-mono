<template>
  <UDashboardPanel id="dashboard-kitchen-orders-in">
    <template #header>
      <LayoutsDashboardNavbar title="Orders In" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Orders In:
          <span class="font-medium">{{ incomingOrders.length }}</span>
        </div>

        <UCard v-if="incomingOrders.length">
          <div class="space-y-2">
            <div
              v-for="order in incomingOrders"
              :key="order.id || order.order_number"
              class="rounded border border-default p-3"
            >
              <div class="font-medium">
                {{ order.order_number || order.name || order.id || 'Incoming Order' }}
              </div>
              <div class="text-xs text-dimmed">
                {{ order.status || 'open' }}
                <template v-if="order.channel"> · {{ order.channel }}</template>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No incoming orders loaded"
          description="No incoming orders yet for this kitchen context."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
const incomingOrders = computed(() => runtime.data.value.incomingOrders ?? [])
</script>
