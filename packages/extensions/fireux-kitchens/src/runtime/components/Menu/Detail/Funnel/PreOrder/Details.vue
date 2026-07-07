<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Pre-order details
    </h2>

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-calendar-clock"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Pre-order details</strong>
        <span>{{ preOrderStatus }}</span>
      </div>
    </section>

    <div class="menu-order-dispatch__divider" />

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-credit-card"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Deposit</strong>
        <span>{{ depositStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../models/kitchen/menu/menu-ordering.model'
import { usePreOrderFunnel } from '../../../../../composables/fireux/kitchen/order/funnel/PreOrder/usePreOrderFunnel'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const {
  depositStatus,
  detailsStatus: preOrderStatus,
  ready,
} = usePreOrderFunnel(() => props.order)

watchEffect(() => {
  emit('update:ready', ready.value)
})
</script>
