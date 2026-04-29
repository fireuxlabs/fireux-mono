<template>
  <div class="space-y-6">
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

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleOrders'

const toTimeLabel = (value: any) => {
  const seconds = Number(value?.seconds)
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  return new Date(seconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const { orders, debug } = useKitchenConsoleOrders()
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
const isDev = import.meta.dev
</script>
