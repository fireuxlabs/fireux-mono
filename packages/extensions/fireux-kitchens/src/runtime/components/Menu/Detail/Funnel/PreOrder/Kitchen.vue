<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Kitchen
    </h2>

    <p class="menu-order-step-label">
      Kitchen operator {{ operatorStatus }}
    </p>

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-chef-hat"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Contacting kitchen</strong>
        <span>{{ kitchenStatus }}</span>
      </div>
    </section>

    <div class="menu-order-dispatch__divider" />

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-clock"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Pre-order timing</strong>
        <span>{{ timingStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderingFunnelState } from '../../../../../models/kitchen/menu/menu-ordering.model'
import { usePreOrderFunnel } from '../../../../../composables/fireux/kitchen/order/funnel/PreOrder/usePreOrderFunnel'

const props = defineProps<{
  order: MenuOrderingFunnelState
  operatorOnline?: boolean
}>()

const {
  kitchenStatus,
  operatorStatus,
  timingStatus,
} = usePreOrderFunnel(() => props.order, {
  operatorOnline: () => props.operatorOnline,
})
</script>
