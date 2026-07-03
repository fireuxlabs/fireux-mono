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

const confirmationLabel = computed(() => {
  const orderNumber = props.funnel.processing.order_number
  if (!props.funnel.processing.exists) return 'Collection request is not sent yet.'

  return orderNumber
    ? `Collection request ${orderNumber} is with the kitchen.`
    : 'Collection request is with the kitchen.'
})
</script>
