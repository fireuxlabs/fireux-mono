<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Payment
    </h2>

    <p class="menu-order-placeholder">
      {{ paymentLabel }}
    </p>

    <UButton
      v-if="canStartPayment"
      color="primary"
      block
      :loading="funnel.payment.pending"
      @click="startPayment"
    >
      Pay now · {{ totalLabel }}
    </UButton>

    <p
      v-if="funnel.payment.error"
      class="menu-order-placeholder"
    >
      {{ funnel.payment.error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const payment = computed(() => props.funnel.processing.order?.payment)
const orderStatus = computed(() =>
  String(props.funnel.processing.status || props.funnel.processing.order?.status || '').trim()
)
const acceptedByKitchen = computed(() =>
  props.funnel.order.accepted ||
    ['accepted', 'ready'].includes(orderStatus.value)
)
const paymentBeforeKitchen = computed(() =>
  orderStatus.value === 'pending_payment' &&
    payment.value?.required === true &&
    payment.value?.status !== 'paid'
)
const paymentAmount = computed(() => {
  const amount = Number(payment.value?.amount_chf)

  return Number.isFinite(amount) && amount > 0 ? amount : 0
})
const currencyCode = computed(() =>
  props.funnel.order.currencyCode.trim().toUpperCase()
)
const totalLabel = computed(() =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currencyCode.value,
  }).format(paymentAmount.value)
)
const canStartPayment = computed(() =>
  props.funnel.processing.exists &&
    payment.value?.required === true &&
    (acceptedByKitchen.value || paymentBeforeKitchen.value) &&
    payment.value?.status !== 'paid' &&
    !['cancelled', 'completed', 'trashed'].includes(orderStatus.value) &&
    paymentAmount.value > 0
)
const paymentLabel = computed(() => {
  if (!props.funnel.processing.exists) return 'Waiting for kitchen timing first.'
  if (orderStatus.value === 'cancelled') return 'The kitchen could not accept this order.'
  if (payment.value?.required !== true) {
    return 'No online payment is required for this order.'
  }
  if (paymentAmount.value <= 0) {
    return 'Online payment is not available for this order.'
  }
  if (payment.value?.status === 'paid') {
    return props.funnel.payment.message || 'Payment accepted.'
  }
  if (payment.value?.status === 'pending') {
    return props.funnel.payment.message || 'Payment is in progress.'
  }
  if (paymentBeforeKitchen.value) return 'Secure card payment is ready.'
  if (!acceptedByKitchen.value) return 'Waiting for kitchen timing first.'
  if (props.funnel.payment.message) return props.funnel.payment.message

  return 'Secure card payment is ready.'
})

async function startPayment() {
  try {
    await props.funnel.pay()
  } catch {
    // The funnel payment state owns the visible error.
  }
}
</script>
