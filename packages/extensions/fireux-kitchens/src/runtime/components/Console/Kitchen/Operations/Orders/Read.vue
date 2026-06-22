<template>
  <div class="space-y-6">
    <p v-if="pending" class="text-sm text-dimmed">
      Loading orders...
    </p>

    <div
      v-else-if="ticketOrders.length"
      class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      <OrderCardsTicket
        v-for="ticket in ticketOrders"
        :key="ticket.id"
        :order="ticket"
      />
    </div>

    <p v-else class="text-sm text-dimmed">
      No orders for this kitchen yet.
    </p>

    <DevFireuxDebugPanel
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenConsoleOrders'

const {
  ticketOrders,
  pending,
  debug,
} = useKitchenConsoleOrders()
</script>
