<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Fulfilment
    </h2>

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-chef-hat"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>{{ kitchen.title }}</strong>
        <span>{{ kitchen.status }}</span>
      </div>
    </section>

    <div class="menu-order-dispatch__divider" />

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-radio-tower"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Hailing drivers</strong>
        <span>{{ driverStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
} from '../../../../../models/kitchen/menu/menu-ordering.model'
import { useDeliveryFunnel } from '../../../../../composables/fireux/kitchen/order/funnel/Delivery/useDeliveryFunnel'

const props = defineProps<{
  order: MenuOrderingFunnelState
  delivery?: MenuOrderingDeliveryState | null
  driverWatchingCount?: number
  orderId?: string
}>()

const {
  driverStatus,
  kitchen,
} = useDeliveryFunnel(() => props.order, {
  delivery: () => props.delivery,
  driverWatchingCount: () => props.driverWatchingCount,
  orderId: () => props.orderId,
})
</script>
