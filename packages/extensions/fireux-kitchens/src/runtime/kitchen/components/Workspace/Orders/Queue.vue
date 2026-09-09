<template>
  <WorkspaceKitchenOrdersRail
    v-if="queueOrders.length"
    label="Queue"
    :count="queueOrders.length"
    empty-label="No orders in preparation"
    accent="warning"
  >
    <div class="orders-queue">
      <WorkspaceKitchenOrdersTicket
        v-for="ticket in queueOrders"
        :key="ticket.id"
        :order="ticket"
        stage="queue"
        :interactive="canInteract(ticket)"
        :status-action-pending="isOrderTransitioning(ticket.id)"
        @ready="markQueueOrderReady"
      />
    </div>
  </WorkspaceKitchenOrdersRail>
</template>

<script setup lang="ts">
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersQueue' })

const { queueOrders, canInteract, isOrderTransitioning, markQueueOrderReady } =
  useKitchenOrdersContext()
</script>

<style scoped>
.orders-queue {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: calc(var(--spacing) * 2);
}
</style>
