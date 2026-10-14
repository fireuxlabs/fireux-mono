<template>
  <div class="w-full max-w-sm" :data-testid="`${name}-ticket-preview`">
    <Ticket :order="order" :editable="false" />
  </div>
  <details class="max-w-sm rounded-lg border border-default p-4">
    <summary class="cursor-pointer text-sm font-medium">
      View {{ label }} data
    </summary>
    <pre
      class="mt-3 overflow-auto text-sm"
      :data-testid="`${name}-json`"
    ><code>{{ JSON.stringify(order, null, 2) }}</code></pre>
  </details>
</template>
<script setup lang="ts">
import Ticket from '../../Orders/Ticket.vue'
import type { Order } from '../../../models/order.model'
defineProps<{ order: Order; name: string; label: string }>()
</script>
