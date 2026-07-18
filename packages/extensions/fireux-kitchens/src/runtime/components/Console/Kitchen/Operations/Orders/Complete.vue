<template>
  <ConsoleKitchenOperationsOrdersRail
    label="Complete"
    :count="recentOrders.length"
    empty-label="No completed orders yet"
  >
    <ConsoleKitchenOperationsOrdersCardsTicket
      v-for="order in recentOrders"
      :key="order.id"
      :order="order"
    />
  </ConsoleKitchenOperationsOrdersRail>
</template>

<script setup lang="ts">
import { useKitchenOrdersWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersComplete' })

const { recentOrders } = useKitchenOrdersWorkspace()
</script>
