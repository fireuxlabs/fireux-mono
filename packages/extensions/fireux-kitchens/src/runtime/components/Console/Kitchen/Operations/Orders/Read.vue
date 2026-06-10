<template>
  <div class="space-y-6">
    <OrdersCollectionManager
      :orders="orders"
      title="Orders"
    />

    <DevFireuxDebugPanel
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleOrders'

const { orders, debug } = useKitchenConsoleOrders()
</script>
