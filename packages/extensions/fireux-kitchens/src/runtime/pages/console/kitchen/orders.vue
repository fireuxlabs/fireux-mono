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

        <ConsoleKitchenChildLayout
          v-else
          description="Selected kitchen and order collection in scope."
          item-label="Orders"
          :item-count="countLabel"
          :pending="pending"
          pending-title="Loading orders"
          pending-description="Fetching orders for the selected kitchen."
        >
          <UCard>
            <template #header>
              <div class="console-card-header">
                <div class="console-card-header__title">Orders</div>
                <p class="console-card-header__description">
                  Browse current orders for the selected kitchen.
                </p>
              </div>
            </template>

            <div v-if="orderCards.length" class="flex flex-wrap gap-3">
              <OrganismsOrderCard
                v-for="card in orderCards"
                :key="card.id"
                v-bind="card"
              />
            </div>

            <p v-else class="text-sm text-dimmed">No orders found.</p>
          </UCard>
        </ConsoleKitchenChildLayout>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleChildFocus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleChildFocus'
import { useKitchenOrdersFetch } from '../../../composables/fireux/firestore/runtime-kitchen/orders/fetch/useKitchenOrdersFetch'

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

const { selectedKitchen, kitchenId } = useKitchenConsoleChildFocus()
const { orders, pending } = useKitchenOrdersFetch(kitchenId)

const countLabel = computed(() => String(orders.value.length))

const toTimeLabel = (value: any) => {
  const seconds = Number(value?.seconds)
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  return new Date(seconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const orderCards = computed(() =>
  orders.value.map((order) => ({
    id: String(order.id || '').trim(),
    contextLabel: String(order.order_number || '').trim() || 'Order',
    timeLabel:
      toTimeLabel((order as any).updated?.at) ||
      toTimeLabel((order as any).created?.at) ||
      String(order.status || '').trim(),
    serverName: String(order.channel || '').trim(),
    lines: Array.isArray(order.items)
      ? order.items.map((item) => ({
          label: String(item.label || '').trim() || 'Item',
          qty: Number(item.quantity || 0),
        }))
      : [],
  }))
)
</script>
