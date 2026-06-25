<template>
  <div class="menu-order-funnel">
    <p v-if="message" class="menu-order-funnel__message">
      {{ message }}
    </p>

    <MenuFunnelPayment :methods="paymentMethods" />

    <MenuFunnelFields
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../models/order.model'

const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    policy?: MenuOrderTypeConfig
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

const fulfilment = computed(() => props.policy?.fulfilment || {})
const paymentMethods = computed(() =>
  Array.isArray(fulfilment.value.payment_methods)
    ? fulfilment.value.payment_methods
    : []
)
const message = computed(() => props.policy?.message || '')
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}

.menu-order-funnel__message {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
}
</style>
