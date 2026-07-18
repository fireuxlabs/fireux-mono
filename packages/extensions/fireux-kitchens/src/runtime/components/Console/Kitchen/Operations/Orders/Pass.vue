<template>
  <div class="orders-pass" data-order-rail="pass">
    <ConsoleKitchenOperationsOrdersTicket
      v-for="ticket in passOrders"
      :key="ticket.id"
      :order="ticket"
      stage="pass"
      :interactive="canInteract(ticket)"
      :selected="pass.isSelected(ticket.id)"
      @return="returnPassOrder"
      @toggle="pass.toggle"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenOrdersWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersPass' })

const {
  passOrders,
  pass,
  canInteract,
  returnPassOrder,
} = useKitchenOrdersWorkspace()
</script>

<style scoped>
.orders-pass {
  display: flex;
  gap: 0.5rem;
}
</style>
