<template>
  <div :data-testid="`${name}-ticket-preview`">
    <KitchenOrdersTicket :order="order" :editable="false" />
  </div>
  <FireDisclosurePanel :title="`View ${label} data`" :default-open="false">
    <pre
      class="overflow-auto"
      :data-testid="`${name}-json`"
    ><code>{{ JSON.stringify(order, null, 2) }}</code></pre>
  </FireDisclosurePanel>
</template>
<script setup lang="ts">
import type { Order } from '../../../models/order.model'
defineProps<{ order: Order; name: string; label: string }>()
</script>
