<template>
  <div
    v-if="passOrders.length"
    class="orders-pass"
    data-order-rail="pass"
  >
    <WorkspaceKitchenOperationsOrdersTicket
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
import { useKitchenOrdersWorkspace } from '../../../../composables/workspace/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOperationsOrdersPass' })

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
  gap: calc(var(--spacing) * 2);
}
</style>
