<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenOrdersRead />

    <OrganismsConsoleKitchenOrdersWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleOrders'

const { canWrite } = useKitchenConsoleOrders()
</script>
