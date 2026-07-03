<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Confirmation
    </h2>

    <p class="menu-order-placeholder">
      {{ confirmationLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const requestLabel = computed(() => {
  if (props.funnel.order.orderType === 'collection') return 'Collection request'
  if (props.funnel.order.orderType === 'delivery') return 'Delivery order'

  return 'Order'
})
const confirmationLabel = computed(() => {
  const orderNumber = props.funnel.processing.order_number
  if (!props.funnel.processing.exists) return `${requestLabel.value} is not sent yet.`

  return orderNumber
    ? `${requestLabel.value} ${orderNumber} is with the kitchen.`
    : `${requestLabel.value} is with the kitchen.`
})
</script>
