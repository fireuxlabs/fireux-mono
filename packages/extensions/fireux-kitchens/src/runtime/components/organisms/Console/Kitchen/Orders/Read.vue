<template>
  <div class="space-y-6">
    <OrganismsOrdersCollectionManager
      :orders="orders"
      title="Orders"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleOrders'

const { orders, debug } = useKitchenConsoleOrders()
const isDev = import.meta.dev
</script>
