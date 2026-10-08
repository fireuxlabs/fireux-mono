<template>
  <div v-if="passOrders.length" class="orders-pass" data-order-rail="pass">
    <WorkspaceKitchenOrdersTicket
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
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersPass' })

const { passOrders, pass, canInteract, returnPassOrder } =
  useKitchenOrdersContext()
</script>

<style scoped>
.orders-pass {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: calc(var(--spacing) * 2);
}
</style>
