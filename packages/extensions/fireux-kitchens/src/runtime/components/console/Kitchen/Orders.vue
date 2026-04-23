<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleKitchenOrdersRead
      :orders="orders"
      :pending="pending"
    />

    <OrganismsConsoleKitchenOrdersWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleOrders'

const { orders, pending, canWrite } = useKitchenConsoleOrders()
</script>
