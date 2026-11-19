<template>
  <div :data-testid="`${name}-ticket-preview`">
    <PublicKitchenOrdersTicket :order="order" />
  </div>
  <FireDisclosurePanel :title="`View ${label} data`" :default-open="false">
    <pre
      class="overflow-auto"
      :data-testid="`${name}-json`"
    ><code>{{ JSON.stringify(order, null, 2) }}</code></pre>
  </FireDisclosurePanel>
</template>
<script setup lang="ts">
import type { Order } from 'fireux-kitchens/runtime/kitchen/records/order'
defineProps<{ order: Order; name: string; label: string }>()
</script>
