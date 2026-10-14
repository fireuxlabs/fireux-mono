<template>
  <div class="w-full max-w-sm" :data-testid="`${name}-ticket-preview`">
    <KitchenOrdersTicket :order="order" :editable="false" />
  </div>
  <MoleculesDisclosurePanel
    :title="`View ${label} data`"
    class="max-w-sm"
    :default-open="false"
  >
    <pre
      class="mt-3 overflow-auto text-sm"
      :data-testid="`${name}-json`"
    ><code>{{ JSON.stringify(order, null, 2) }}</code></pre>
  </MoleculesDisclosurePanel>
</template>
<script setup lang="ts">
import type { Order } from '../../../models/order.model'
defineProps<{ order: Order; name: string; label: string }>()
</script>
