<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Payment
    </h2>

    <p class="menu-order-placeholder">
      {{ paymentLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const paymentLabel = computed(() => {
  const payment = props.funnel.processing.order?.payment
  if (!props.funnel.processing.exists) return 'Waiting for kitchen timing first.'
  if (!payment?.required) return 'No online payment needed yet.'
  if (payment.status === 'paid') return 'Payment received.'

  return 'Secure payment will open here.'
})
</script>
