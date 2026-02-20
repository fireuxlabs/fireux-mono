<template>
  <UDashboardPanel id="dashboard-kitchen-orders-in">
    <template #header>
      <LayoutsDashboardNavbar title="Orders In" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Orders In:
          <span class="font-medium">{{ openOrders.length }}</span>
        </div>

        <UCard v-if="openOrders.length">
          <div class="space-y-2">
            <button
              v-for="order in openOrders"
              :key="order.id || order.order_number"
              type="button"
              class="w-full rounded border border-default p-3 text-left hover:bg-[var(--ui-bg-elevated)]"
              @click="handleClose(order)"
            >
              <div class="font-medium">
                {{ order.items?.[0]?.label || order.order_number || order.name || order.id || 'Incoming Order' }}
              </div>
              <div class="text-xs text-dimmed">
                Order: {{ order.order_number || '-' }}
              </div>
              <div class="text-xs text-dimmed">
                {{ order.status || 'open' }}
                <template v-if="order.channel"> · {{ order.channel }}</template>
              </div>
            </button>
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
import { useKitchenOrderToggleItem } from '../../../composables/fireux/firestore/runtime-kitchen/orders/mutations/useKitchenOrderToggleItem'

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
const kitchenId = computed(() => String(runtime.id.value || '').trim())
const incomingOrders = computed<Record<string, any>[]>(
  () => (runtime.data.value.kitchenOrders as Record<string, any>[] | undefined) ?? []
)
const openOrders = computed(() =>
  incomingOrders.value.filter((order) => String(order?.status || 'open') === 'open')
)

const { closeOrder } = useKitchenOrderToggleItem()

const handleClose = async (order: Record<string, any>) => {
  const orderId = String(order?.id || '').trim()
  if (!kitchenId.value || !orderId) return

  await closeOrder({
    kitchenId: kitchenId.value,
    orderId,
  })
}
</script>
