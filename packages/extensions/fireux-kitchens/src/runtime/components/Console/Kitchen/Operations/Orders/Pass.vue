<template>
  <div class="orders-pass" data-order-rail="pass">
    <ConsoleKitchenOperationsOrdersTicket
      v-for="ticket in orders"
      :key="ticket.id"
      :order="ticket"
      stage="pass"
      :interactive="canInteract(ticket)"
      :selected="isSelected(ticket.id)"
      @return="$emit('return', $event)"
      @toggle="$emit('toggle', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { KitchenOrder } from '../../../../../models/kitchen/order.model'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersPass' })

defineProps<{
  orders: KitchenOrder[]
  canInteract: (order: KitchenOrder) => boolean
  isSelected: (orderId: unknown) => boolean
}>()

defineEmits<{
  return: [id: string]
  toggle: [id: string]
}>()
</script>

<style scoped>
.orders-pass {
  display: flex;
  min-width: 0;
  gap: 0.75rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ui-border);
}

.orders-pass > * {
  flex: none;
  width: min(20rem, 82vw);
}

@media (min-width: 1280px) {
  .orders-pass > * {
    width: 20rem;
  }
}
</style>
