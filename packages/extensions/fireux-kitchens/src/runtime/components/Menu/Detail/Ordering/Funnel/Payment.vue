<template>
  <div v-if="paymentLabels.length" class="menu-order-payment">
    <p>Payment</p>
    <span>{{ paymentLabels.join(', ') }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuPaymentMethod } from '../../../../../models/menu/menu.model'

const props = withDefaults(
  defineProps<{
    methods?: MenuPaymentMethod[]
  }>(),
  {
    methods: () => [],
  }
)

const paymentLabel = (method: MenuPaymentMethod) => {
  const paymentLabels: Record<MenuPaymentMethod, string> = {
    cash: 'Cash',
    card_at_pickup: 'Card at pickup',
    card_to_driver: 'Card to driver',
    online_card: 'Online card',
    deposit: 'Deposit',
  }

  return paymentLabels[method] || method
}
const paymentLabels = computed(() =>
  props.methods.map(paymentLabel)
)
</script>

<style scoped>
.menu-order-payment {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0;
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  color: var(--menu-muted);
  font-size: 0.88rem;
}

.menu-order-payment p {
  margin: 0;
  color: var(--menu-title);
  font-weight: 850;
}
</style>
