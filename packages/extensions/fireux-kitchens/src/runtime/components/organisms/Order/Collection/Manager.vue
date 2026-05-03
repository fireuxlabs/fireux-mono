<template>
  <div>
    <div v-if="ticketOrders.length" class="flex flex-wrap items-start gap-3">
      <OrganismsOrderCardsTicket
        v-for="ticket in ticketOrders"
        :key="ticket.id"
        :order="ticket"
      />
    </div>

    <p v-else class="text-sm text-dimmed">No orders found.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../models/order.model'

const props = defineProps<{
  orders: KitchenOrder[]
}>()

const timestampMs = (value: unknown) => {
  const seconds = Number((value as { seconds?: number } | null)?.seconds)
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0
}

const orderTime = (order: KitchenOrder) =>
  timestampMs((order as any).created?.at) ||
  timestampMs((order as any).updated?.at)

const ticketOrders = computed(() =>
  [...props.orders].sort((a, b) => {
    const aTime = orderTime(a)
    const bTime = orderTime(b)
    if (aTime !== bTime) return aTime - bTime
    return String(a.order_number || a.id).localeCompare(
      String(b.order_number || b.id)
    )
  })
)
</script>
