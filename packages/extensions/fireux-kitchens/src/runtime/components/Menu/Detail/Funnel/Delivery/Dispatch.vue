<template>
  <div class="menu-order-dispatch">
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
import { useKitchenOrderFunnelDispatch } from '../../../../../composables/fireux/kitchen/order/funnel/useKitchenOrderFunnelDispatch'

const props = defineProps<{
  order: MenuOrderingFunnelState
  delivery?: MenuOrderingDeliveryState | null
  orderPath?: string
}>()

const {
  driverStatus,
  kitchen,
} = useKitchenOrderFunnelDispatch(
  () => props.order,
  () => props.delivery,
  () => props.orderPath
)
</script>
