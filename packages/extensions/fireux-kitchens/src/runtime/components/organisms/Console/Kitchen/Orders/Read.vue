<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading orders"
    description="Fetching orders for the selected kitchen."
  />

  <UCard v-else>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../../models/order.model'

const props = defineProps<{
  orders: KitchenOrder[]
  pending: boolean
}>()

const toTimeLabel = (value: any) => {
  const seconds = Number(value?.seconds)
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  return new Date(seconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const orderCards = computed(() =>
  props.orders.map((order) => ({
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
