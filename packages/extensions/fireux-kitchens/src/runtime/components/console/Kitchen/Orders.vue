<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenOrdersRead :orders="orders" />

    <OrganismsConsoleKitchenOrdersWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleOrders'

const { orders, canWrite } = useKitchenConsoleOrders()
</script>
